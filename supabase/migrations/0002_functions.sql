-- Matchmaking and moderation functions. All run as security definer.

-- Pro status. Payments are not wired yet, so this just reads profiles.pro_until.
create or replace function public.is_pro(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select pro_until > now() from public.profiles where id = uid), false);
$$;

create or replace function public.confirm_age(p_version text default 'v1') returns void
language sql security definer set search_path = public as $$
  update public.profiles
     set age_confirmed_at = now(), consent_version = p_version
   where id = auth.uid();
$$;

create or replace function public.my_active_room() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.rooms
   where status = 'active' and auth.uid() in (user_a, user_b)
   order by created_at desc limit 1;
$$;

-- Try to pair the current user with a compatible waiting user.
create or replace function public.try_match() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  my_q public.match_queue%rowtype;
  partner public.match_queue%rowtype;
  existing uuid;
  new_room uuid;
begin
  if me is null then raise exception 'not authenticated'; end if;

  existing := public.my_active_room();
  if existing is not null then
    return jsonb_build_object('status', 'matched', 'room_id', existing);
  end if;

  -- Lock our own queue row. If someone else is pairing with us right now, skip.
  select * into my_q from public.match_queue
   where user_id = me and status = 'waiting'
   for update skip locked;
  if not found then
    return jsonb_build_object('status', 'waiting');
  end if;

  select q.* into partner
    from public.match_queue q
   where q.status = 'waiting'
     and q.user_id <> me
     and not exists (
       select 1 from public.blocks b
        where (b.blocker_id = me and b.blocked_id = q.user_id)
           or (b.blocker_id = q.user_id and b.blocked_id = me))
     and not exists (
       select 1 from public.recent_matches r
        where r.user_a = least(me, q.user_id) and r.user_b = greatest(me, q.user_id)
          and r.matched_at > now() - interval '30 minutes')
     and (q.language = my_q.language or q.language = 'any' or my_q.language = 'any')
   order by q.priority_score desc, q.joined_at asc
   for update skip locked
   limit 1;

  if not found then
    return jsonb_build_object('status', 'waiting');
  end if;

  insert into public.rooms (user_a, user_b) values (me, partner.user_id) returning id into new_room;
  insert into public.recent_matches (user_a, user_b)
    values (least(me, partner.user_id), greatest(me, partner.user_id));
  delete from public.match_queue where user_id in (me, partner.user_id);

  update public.profiles
     set daily_chat_count = case when daily_chat_reset < current_date then 1 else daily_chat_count + 1 end,
         daily_chat_reset = current_date
   where id in (me, partner.user_id);

  -- Push the match to the waiting partner. Failure here is fine: their heartbeat will find the room.
  begin
    perform realtime.send(
      jsonb_build_object('room_id', new_room),
      'matched',
      'user:' || partner.user_id::text,
      false
    );
  exception when others then
    null;
  end;

  return jsonb_build_object('status', 'matched', 'room_id', new_room);
end;
$$;

create or replace function public.join_queue(p_language text default 'any', p_interests text[] default '{}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  prof public.profiles%rowtype;
  -- Free daily chat limit. NULL = unlimited (payments are off). Set to 15 when Pro launches.
  free_daily_limit int := null;
begin
  if me is null then raise exception 'not authenticated'; end if;

  if exists (select 1 from public.bans b
              where b.user_id = me and (b.expires_at is null or b.expires_at > now())) then
    return jsonb_build_object('status', 'banned');
  end if;

  select * into prof from public.profiles where id = me;
  if prof.age_confirmed_at is null then
    return jsonb_build_object('status', 'consent_required');
  end if;

  if prof.daily_chat_reset < current_date then
    update public.profiles set daily_chat_count = 0, daily_chat_reset = current_date where id = me;
    prof.daily_chat_count := 0;
  end if;
  if free_daily_limit is not null and not public.is_pro(me) and prof.daily_chat_count >= free_daily_limit then
    return jsonb_build_object('status', 'limit_reached');
  end if;

  delete from public.match_queue where user_id = me;
  insert into public.match_queue (user_id, language, interests, priority_score)
  values (me, coalesce(p_language, 'any'), coalesce(p_interests, '{}'),
          case when public.is_pro(me) then 10 else 0 end);

  return public.try_match();
end;
$$;

create or replace function public.queue_heartbeat() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  update public.match_queue set last_heartbeat = now() where user_id = auth.uid();
  return public.try_match();
end;
$$;

create or replace function public.leave_queue() returns void
language sql security definer set search_path = public as $$
  delete from public.match_queue where user_id = auth.uid();
$$;

create or replace function public.close_room(p_room_id uuid, p_reason text default 'next') returns void
language sql security definer set search_path = public as $$
  update public.rooms
     set status = 'closed', closed_at = now(), closed_by = auth.uid(), close_reason = p_reason
   where id = p_room_id and status = 'active' and auth.uid() in (user_a, user_b);
$$;

create or replace function public.block_user(p_room_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare partner uuid;
begin
  select case when user_a = auth.uid() then user_b else user_a end into partner
    from public.rooms where id = p_room_id and auth.uid() in (user_a, user_b);
  if partner is null then return; end if;
  insert into public.blocks (blocker_id, blocked_id) values (auth.uid(), partner) on conflict do nothing;
  perform public.close_room(p_room_id, 'block');
end;
$$;

create or replace function public.report_user(
  p_room_id uuid, p_reason report_reason, p_details text default null, p_snapshot jsonb default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  partner uuid;
  valid_reports int;
begin
  select case when user_a = auth.uid() then user_b else user_a end into partner
    from public.rooms where id = p_room_id and auth.uid() in (user_a, user_b);
  if partner is null then return; end if;

  insert into public.reports (reporter_id, reported_id, room_id, reason, details, snapshot)
  values (auth.uid(), partner, p_room_id, p_reason, left(p_details, 500), p_snapshot);

  insert into public.blocks (blocker_id, blocked_id) values (auth.uid(), partner) on conflict do nothing;
  perform public.close_room(p_room_id, 'report');

  -- Simple auto-ban: 5 reports from 5 different people in 24h = 24h ban. Review these manually.
  select count(distinct reporter_id) into valid_reports
    from public.reports where reported_id = partner and created_at > now() - interval '24 hours';
  if valid_reports >= 5 then
    insert into public.bans (user_id, reason, expires_at)
    values (partner, 'auto: multiple reports', now() + interval '24 hours');
  end if;
end;
$$;

-- Housekeeping: drop stale queue rows. Needs the pg_cron extension (Database > Extensions).
-- select cron.schedule('queue-cleanup', '15 seconds',
--   $$ delete from public.match_queue where last_heartbeat < now() - interval '20 seconds' $$);

-- Let signed-in users (including guests) call the RPCs.
grant execute on function public.confirm_age(text) to authenticated;
grant execute on function public.my_active_room() to authenticated;
grant execute on function public.join_queue(text, text[]) to authenticated;
grant execute on function public.queue_heartbeat() to authenticated;
grant execute on function public.leave_queue() to authenticated;
grant execute on function public.close_room(uuid, text) to authenticated;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.report_user(uuid, report_reason, text, jsonb) to authenticated;
-- try_match and is_pro are internal: not granted to clients.
revoke execute on function public.try_match() from public, anon, authenticated;
