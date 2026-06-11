"use client";

import { useEffect, useMemo, useState } from "react";

import { CarSummaryCardLite } from "@/components/concierge/artifacts";
import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import {
  BOOKING_CAR_COLOR,
  BOOKING_CAR_TITLE,
  BOOKING_CAR_VARIANT,
} from "@/components/kyc/booking-car-card-content";
import {
  DEMO_VEHICLE_CHASSIS_NO,
  DEMO_VEHICLE_ENGINE_NO,
} from "@/components/kyc/demo-vehicle-identification";
import { fireBasicCannon } from "@/lib/confetti-basic-cannon";
import {
  DEFAULT_EXPERIENCE_FLOW,
  readExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import { cn } from "@/lib/utils";

const DEALER_NAME = "Advaith Hyundai";
const DEALER_DETAIL = "Whitefield · Bengaluru";

/** Candidate delivery days inside the promised window (flow-aware). */
const EXPRESS_DAYS = ["Sat 7 Jun", "Sun 8 Jun", "Mon 9 Jun", "Tue 10 Jun"] as const;
const STANDARD_DAYS = ["Thu 22 Oct", "Fri 23 Oct", "Sat 24 Oct", "Sun 25 Oct"] as const;

const WINDOWS = ["Morning · 9–12", "Afternoon · 12–4", "Evening · 4–8"] as const;

function SlotChips({
  options,
  selected,
  onSelect,
  label,
}: {
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string) => void;
  label: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase leading-4 tracking-[0.06em] text-[#8f8e92]">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option === selected;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium leading-5 transition-colors",
                isSelected
                  ? "border-[#121212] bg-[#121212] text-white"
                  : "border-[#e0e0e0] bg-white text-[#121212] hover:bg-[#fafafa]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The climax turn — Shivi asks for the slot right here (inline picker, no
 * detour), then locks it in with confetti. Final turn of the demo journey.
 */
export function CarDeliveryScheduleScreen() {
  const [flow, setFlow] = useState<ExperienceFlow>(DEFAULT_EXPERIENCE_FLOW);
  const [day, setDay] = useState<string | null>(null);
  const [windowSlot, setWindowSlot] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    setFlow(readExperienceFlow());
  }, []);

  const days = flow === "standard" ? STANDARD_DAYS : EXPRESS_DAYS;

  const replies = useMemo(
    () => [
      {
        label: "Lock this slot",
        onClick: () => {
          setScheduled(true);
          fireBasicCannon();
        },
        disabled: day == null || windowSlot == null,
        echo: null,
      },
    ],
    [day, windowSlot]
  );

  if (scheduled && day && windowSlot) {
    return (
      <ConciergeTurnShell
        says={[
          `Locked — ${day}, ${windowSlot.toLowerCase()}.`,
          "Your Creta arrives at your door. I'll send the driver's details and your registration number the day before. It's been a pleasure, Sharath — enjoy every kilometre.",
        ]}
        artifact={
          <CarSummaryCardLite
            title={BOOKING_CAR_TITLE}
            variant={BOOKING_CAR_VARIANT}
            colour={BOOKING_CAR_COLOR}
            deliveryLine={`Arriving ${day} · ${windowSlot}`}
            dealerName={DEALER_NAME}
            dealerDetail={DEALER_DETAIL}
            engineNo={DEMO_VEHICLE_ENGINE_NO}
            chassisNo={DEMO_VEHICLE_CHASSIS_NO}
          />
        }
        timeSkip={{ label: "Start over", href: "/quote" }}
      />
    );
  }

  return (
    <ConciergeTurnShell
      says={[
        "Your Creta is ready, Sharath.",
        `Registered, insured, and waiting at ${DEALER_NAME}. Pick a day and a window — I'll have it at your door.`,
      ]}
      replies={replies}
      callLabel="Special instructions? I can call you"
    >
      <div className="flex flex-col gap-5 rounded-2xl bg-white card-elevated px-4 py-4">
        <SlotChips options={days} selected={day} onSelect={setDay} label="Pick a day" />
        <SlotChips
          options={WINDOWS}
          selected={windowSlot}
          onSelect={setWindowSlot}
          label="Pick a window"
        />
      </div>
    </ConciergeTurnShell>
  );
}
