import type { Msg } from "@/types";

export function MessageBubble({ msg }: { msg: Msg }) {
  if (msg.from === "system") {
    return <p className="msg-in my-2 text-center text-sm text-mist/50">{msg.text}</p>;
  }
  const mine = msg.from === "me";
  return (
    <div className={`msg-in flex ${mine ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[80%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 leading-snug ${
          mine ? "rounded-br-lg bg-mist text-ink" : "rounded-bl-lg text-mist"
        }`}
        style={mine ? undefined : { background: "color-mix(in srgb, var(--tint) 22%, transparent)" }}
      >
        {msg.text}
      </p>
    </div>
  );
}
