"use client";

import { cn } from "@/lib/utils";

export type UserEchoChipProps = {
  /** The user's last reply, landing on this turn. */
  text: string;
  className?: string;
};

/**
 * Your side of the conversation — a single sent-message chip, right-aligned.
 * Only ever one on screen; the thread never accumulates.
 */
export function UserEchoChip({ text, className }: UserEchoChipProps) {
  return (
    <div className={cn("flex w-full justify-end", className)}>
      <div className="concierge-echo-in flex max-w-[82%] items-center gap-2 rounded-2xl rounded-br-md bg-[#121212] px-4 py-2.5">
        <span className="text-sm font-normal leading-5 text-white">{text}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
          <path
            d="M5 13l4 4L19 7"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
