import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const revalidate = 10; // cache for 10 seconds

export async function GET() {
  try {
    const sb = getAdminSupabase();
    const [rooms, queue] = await Promise.all([
      sb.from("rooms").select("id", { count: "exact", head: true }).eq("status", "active"),
      sb.from("match_queue").select("id", { count: "exact", head: true }).eq("status", "waiting"),
    ]);
    const count = (rooms.count ?? 0) * 2 + (queue.count ?? 0);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
