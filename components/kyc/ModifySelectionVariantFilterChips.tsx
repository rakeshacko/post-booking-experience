"use client";

import Image from "next/image";

import closeIcon from "@/assets/Close.svg";
import type {
  ModifySelectionVariantFilters,
  ModifySelectionVariantFuel,
  ModifySelectionVariantTransmission,
} from "@/lib/modify-selection-variants-content";
import { cn } from "@/lib/utils";

type ModifySelectionVariantFilterChipsProps = {
  filters: ModifySelectionVariantFilters;
  onFuelChange: (fuel: ModifySelectionVariantFuel | null) => void;
  onTransmissionChange: (transmission: ModifySelectionVariantTransmission | null) => void;
};

function FilterChip({
  label,
  selected,
  onSelect,
  onClear,
  className,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-[32px] border px-[7px] text-xs font-medium leading-[18px] text-[#121212] transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2",
        selected
          ? "border-[#121212] bg-[#f3f3f3] pr-1"
          : "border-[#e8e8e8] bg-white hover:bg-[#fafafa]",
        className,
      )}
    >
      <span>{label}</span>
      {selected && onClear != null ? (
        <span
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onClear();
            }
          }}
          className="relative flex size-4 shrink-0 items-center justify-center"
          aria-label={`Clear ${label} filter`}
        >
          <Image src={closeIcon} alt="" width={16} height={16} className="size-4" unoptimized />
        </span>
      ) : null}
    </button>
  );
}

/**
 * Quick filters — fuel and transmission chips (Figma 2682:9105).
 */
export function ModifySelectionVariantFilterChips({
  filters,
  onFuelChange,
  onTransmissionChange,
}: ModifySelectionVariantFilterChipsProps) {
  const toggleFuel = (fuel: ModifySelectionVariantFuel) => {
    onFuelChange(filters.fuel === fuel ? null : fuel);
  };

  const toggleTransmission = (transmission: ModifySelectionVariantTransmission) => {
    onTransmissionChange(filters.transmission === transmission ? null : transmission);
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Filter variants"
    >
      <FilterChip
        label="Petrol"
        selected={filters.fuel === "petrol"}
        onSelect={() => toggleFuel("petrol")}
        onClear={() => onFuelChange(null)}
      />
      <FilterChip
        label="Diesel"
        selected={filters.fuel === "diesel"}
        onSelect={() => toggleFuel("diesel")}
        onClear={() => onFuelChange(null)}
      />
      <span className="mx-0.5 h-5 w-px shrink-0 bg-[#e8e8e8]" aria-hidden />
      <FilterChip
        label="Manual"
        selected={filters.transmission === "manual"}
        onSelect={() => toggleTransmission("manual")}
        onClear={() => onTransmissionChange(null)}
      />
      <FilterChip
        label="Automatic"
        selected={filters.transmission === "automatic"}
        onSelect={() => toggleTransmission("automatic")}
        onClear={() => onTransmissionChange(null)}
        className="min-w-[77px] justify-center"
      />
    </div>
  );
}
