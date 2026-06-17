"use client";

import { DEALER_VISIBILITIES, type DealerVisibility } from "@/lib/dealer-visibility";

export type DealerVisibilityToggleProps = {
  value: DealerVisibility;
  onChange: (visibility: DealerVisibility) => void;
};

/**
 * In-page demo switch for the dealer-found fork — the variation only diverges
 * here, so the control lives on this turn. Flipping it re-renders the turn in
 * place (dialogue, card, next step and CTA all swap) so both variants can be
 * compared without leaving the screen.
 */
export function DealerVisibilityToggle({ value, onChange }: DealerVisibilityToggleProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8d4ea] bg-[#faf9fe] px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2 px-0.5">
        <span className="rounded-full bg-[#ede9fb] px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-[#5920c5]">
          Demo
        </span>
        <span className="text-xs leading-4 text-[#757575]">How the car is confirmed</span>
      </div>
      <div role="radiogroup" aria-label="Dealer visibility" className="flex gap-1 rounded-xl bg-[#efedf6] p-1">
        {DEALER_VISIBILITIES.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={`flex-1 rounded-lg px-2 py-2 text-[13px] font-medium leading-4 transition-colors ${
                selected
                  ? "bg-white text-[#121212] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  : "text-[#6b7280] hover:text-[#121212]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
