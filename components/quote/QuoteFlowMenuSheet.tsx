"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";
import {
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
  BOTTOM_SHEET_SCROLL_BODY_CLASS,
  BOTTOM_SHEET_SCROLL_PANEL_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import {
  EXPERIENCE_FLOWS,
  type ExperienceFlow,
  type ExperienceFlowDefinition,
} from "@/lib/experience-flow";

const SHEET_TRANSITION_MS = 280;

type FlowOptionRowProps = {
  flow: ExperienceFlowDefinition;
  selected: boolean;
  onSelect: (flow: ExperienceFlow) => void;
};

function FlowOptionRow({ flow, selected, onSelect }: FlowOptionRowProps) {
  const disabled = !flow.available;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(flow.id)}
      className={`flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2 ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-[#f5f5f5] active:bg-[#ebebeb]"
      } ${selected ? "bg-[#f5f5f5]" : ""}`}
      aria-pressed={selected}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-[#121212] bg-[#121212]" : "border-[#c4c4c4] bg-white"
        }`}
        aria-hidden
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium leading-5 text-[#121212]">{flow.label}</span>
          {disabled ? (
            <span className="rounded-full bg-[#f0f0f0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">
              Coming soon
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-xs leading-[18px] text-[#6b7280]">{flow.description}</span>
      </span>
    </button>
  );
}

export type QuoteFlowMenuSheetProps = {
  open: boolean;
  activeFlow: ExperienceFlow;
  onClose: () => void;
  onFlowChange: (flow: ExperienceFlow) => void;
};

/**
 * Switch between product experience flows (Express / Standard / Verification failed).
 */
export function QuoteFlowMenuSheet({
  open,
  activeFlow,
  onClose,
  onFlowChange,
}: QuoteFlowMenuSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setMounted(true);
    setAnimateIn(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (open || !mounted) return;
    setAnimateIn(false);
    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      setMounted(false);
    }, SHEET_TRANSITION_MS);
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const handleSelect = useCallback(
    (flow: ExperienceFlow) => {
      const definition = EXPERIENCE_FLOWS.find((item) => item.id === flow);
      if (!definition?.available) return;
      onFlowChange(flow);
      onClose();
    },
    [onClose, onFlowChange],
  );

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Dismiss"
      />
      <div
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col ${BOTTOM_SHEET_SCROLL_PANEL_CLASS} rounded-t-[24px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-flow-menu-title"
      >
        <header className="flex shrink-0 items-center gap-3 bg-white px-5 pt-6">
          <h2
            id="quote-flow-menu-title"
            className="min-w-0 flex-1 text-left text-xl font-semibold leading-7 tracking-[-0.1px] text-[#121212]"
          >
            Switch flows
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cta-ghost flex size-10 shrink-0 items-center justify-end rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <BottomSheetCloseIcon />
          </button>
        </header>

        <div className={`${BOTTOM_SHEET_SCROLL_BODY_CLASS} px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4`}>
          <div className="flex flex-col gap-1">
          {EXPERIENCE_FLOWS.map((flow) => (
            <FlowOptionRow
              key={flow.id}
              flow={flow}
              selected={activeFlow === flow.id}
              onSelect={handleSelect}
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
