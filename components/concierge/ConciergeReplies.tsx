"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { writeConciergeEcho } from "@/lib/concierge/echo";
import { instantRevealEnabled } from "@/lib/concierge/instant";
import { cn } from "@/lib/utils";

/** Brief pressed beat before navigating — your reply visibly “sends”. */
const SEND_BEAT_MS = 160;

export type ConciergeReply = {
  /** User-voice label — this is you answering Shivi. */
  label: string;
  href?: string;
  /** Invoked instead of navigating (e.g. open a confirm sheet). */
  onClick?: () => void;
  /** Filled primary vs quiet secondary answer. */
  kind?: "primary" | "soft";
  /**
   * Words echoed on the next turn (defaults to `label`); `null` sends silently.
   */
  echo?: string | null;
  /** Not answerable yet (e.g. documents still missing). */
  disabled?: boolean;
};

export type ConciergeRepliesProps = {
  replies: readonly ConciergeReply[];
  className?: string;
};

/** The user's reply affordances — buttons that act as their side of the dialogue. */
export function ConciergeReplies({ replies, className }: ConciergeRepliesProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const sentRef = useRef(false);

  const onReply = (reply: ConciergeReply) => {
    if (sentRef.current) return;
    // Sheet-opening replies stay re-tappable (the sheet may be dismissed).
    if (reply.onClick) {
      if (reply.echo != null) {
        writeConciergeEcho(reply.echo);
      }
      reply.onClick();
      return;
    }
    if (!reply.href) return;
    const href = reply.href;
    sentRef.current = true;
    setSending(true);
    if (reply.echo !== null) {
      writeConciergeEcho(reply.echo ?? reply.label);
    }
    if (instantRevealEnabled()) {
      router.push(href);
      return;
    }
    window.setTimeout(() => {
      router.push(href);
    }, SEND_BEAT_MS);
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {replies.map((reply) => (
        <button
          key={reply.label}
          type="button"
          disabled={sending || reply.disabled}
          onClick={() => onReply(reply)}
          className={
            reply.kind === "soft"
              ? "reply-soft-cta"
              : "primary-cta disabled:cursor-not-allowed disabled:bg-[#a0a0a0] disabled:opacity-100 disabled:hover:bg-[#a0a0a0]"
          }
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
