"use client";

import { useState } from "react";

import {
  resolveFinanceStages,
  type FinanceStage,
  type FinanceStageId,
} from "@/lib/finance-status";
import { cn } from "@/lib/utils";

/**
 * The financed purchase, surfaced as a live status — so the otherwise-invisible
 * bank steps are visible and every "your turn" is explicit. Collapsed to the
 * current stage by default; tap to see the whole sequence.
 */
export function FinanceStatusTimeline({
  current,
  className,
}: {
  current: FinanceStageId;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const stages = resolveFinanceStages(current);
  const total = stages.length;
  const doneCount = stages.filter((s) => s.state === "done").length;
  const active = stages.find((s) => s.state === "waiting_you" || s.state === "waiting_bank");

  return (
    <section className="overflow-hidden rounded-2xl bg-white card-elevated">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#fafafa]",
          className,
        )}
      >
        <StageIcon state={active?.state ?? "waiting_bank"} />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-[#8f8e92]">
            Your finance · step {Math.min(doneCount + 1, total)} of {total}
          </span>
          <span className="block truncate text-sm font-medium text-[#121212]">
            {active ? active.label : "All done"}
          </span>
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className={cn("shrink-0 text-[#757575] transition-transform", open && "rotate-180")}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <ol className="flex flex-col border-t border-[#f0f0f0] px-4 py-3">
          {stages.map((stage, i) => (
            <StageRow key={stage.id} stage={stage} last={i === stages.length - 1} />
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function StageRow({ stage, last }: { stage: FinanceStage; last: boolean }) {
  const active = stage.state === "waiting_you" || stage.state === "waiting_bank";
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <StageIcon state={stage.state} />
        {!last ? (
          <span
            className={cn(
              "w-px flex-1",
              stage.state === "done" ? "bg-[#0fa457]/40" : "bg-[#e8e8e8]",
            )}
            aria-hidden
          />
        ) : null}
      </div>
      <div className={cn("min-w-0 flex-1", last ? "pb-0.5" : "pb-4")}>
        <p
          className={cn(
            "text-sm leading-5",
            stage.state === "upcoming" ? "text-[#a0a0a0]" : "font-medium text-[#121212]",
          )}
        >
          {stage.label}
        </p>
        {active ? (
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
              stage.state === "waiting_you"
                ? "bg-[#efe9fb] text-[#5920c5]"
                : "bg-[#fff4e0] text-[#b46a00]",
            )}
          >
            {stage.state === "waiting_you" ? "Your turn" : "With your bank"}
            {stage.state === "waiting_you" && stage.action ? ` · ${stage.action}` : ""}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function StageIcon({ state }: { state: FinanceStage["state"] }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0fa457]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5l4.5 4.5L19 7"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "waiting_you") {
    return (
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#6841e6]/40 [animation-duration:2s] motion-reduce:hidden" />
        <span className="relative h-5 w-5 rounded-full border-2 border-[#6841e6] bg-[#efe9fb]" />
      </span>
    );
  }
  if (state === "waiting_bank") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#d99a23] bg-[#fff4e0]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d99a23] motion-safe:animate-pulse" />
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#e0e0e0] bg-white" aria-hidden />;
}
