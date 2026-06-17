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
  DEALER_NAME,
  DEFAULT_DEALER_VISIBILITY,
  isAckoOnly,
  readDealerVisibility,
  resolveDealerAttribution,
  type DealerVisibility,
} from "@/lib/dealer-visibility";
import {
  DEFAULT_EXPERIENCE_FLOW,
  readExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import { cn } from "@/lib/utils";

/** Candidate days inside the promised window (flow-aware). */
const EXPRESS_DAYS = ["Sat 7 Jun", "Sun 8 Jun", "Mon 9 Jun", "Tue 10 Jun"] as const;
const STANDARD_DAYS = ["Thu 22 Oct", "Fri 23 Oct", "Sat 24 Oct", "Sun 25 Oct"] as const;

const WINDOWS = ["Morning · 9–12", "Afternoon · 12–4", "Evening · 4–8"] as const;

/** Where the car can be collected — the dealer's yard, named only when visible. */
const PICKUP_ADDRESS = "Whitefield, Bengaluru 560066";

type FulfilMode = "pickup" | "home";

function ModeToggle({ mode, onChange }: { mode: FulfilMode; onChange: (m: FulfilMode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#f1f0f5] p-1" role="tablist">
      {(
        [
          ["pickup", "Pick it up"],
          ["home", "Home delivery"],
        ] as const
      ).map(([value, label]) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            className={cn(
              "h-9 rounded-lg text-sm font-medium leading-5 transition-colors",
              active ? "bg-white text-[#121212] shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "text-[#757575]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

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
                  : "border-[#e0e0e0] bg-white text-[#121212] hover:bg-[#fafafa]",
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

function PickupLocationCard({ name }: { name: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3 py-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden>
        <path
          d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11z"
          stroke="#121212"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.4" stroke="#121212" strokeWidth="1.6" />
      </svg>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase leading-4 tracking-[0.06em] text-[#8f8e92]">
          Collect from
        </p>
        <p className="mt-1 text-sm font-medium leading-5 text-[#121212]">{name}</p>
        <p className="text-xs leading-[18px] text-[#757575]">{PICKUP_ADDRESS}</p>
      </div>
    </div>
  );
}

/**
 * The climax turn — most people prefer to collect the car themselves, so pickup
 * leads (with the location), and home delivery is a toggle away. Shivi asks for
 * the slot inline, then locks it with confetti. Final turn of the demo journey.
 */
export function CarDeliveryScheduleScreen() {
  const [flow, setFlow] = useState<ExperienceFlow>(DEFAULT_EXPERIENCE_FLOW);
  const [dealerVisibility, setDealerVisibility] = useState<DealerVisibility>(
    DEFAULT_DEALER_VISIBILITY,
  );
  const [mode, setMode] = useState<FulfilMode>("pickup");
  const [day, setDay] = useState<string | null>(null);
  const [windowSlot, setWindowSlot] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    setFlow(readExperienceFlow());
    setDealerVisibility(readDealerVisibility());
  }, []);

  const dealer = resolveDealerAttribution(dealerVisibility);
  const days = flow === "standard" ? STANDARD_DAYS : EXPRESS_DAYS;
  const pickupName = isAckoOnly(dealerVisibility) ? "AckoDrive Delivery Hub" : DEALER_NAME;
  const isPickup = mode === "pickup";

  const replies = useMemo(
    () => [
      {
        label: isPickup ? "Lock my pickup slot" : "Lock my delivery slot",
        onClick: () => {
          setScheduled(true);
          fireBasicCannon();
        },
        disabled: day == null || windowSlot == null,
        echo: null,
      },
    ],
    [day, windowSlot, isPickup],
  );

  if (scheduled && day && windowSlot) {
    return (
      <ConciergeTurnShell
        says={[
          `Locked — ${day}, ${windowSlot.toLowerCase()}.`,
          isPickup
            ? `Come by ${pickupName} and it's yours. Bring your driving licence and I'll have the keys ready. It's been a pleasure, Sharath — enjoy every kilometre.`
            : "Your Creta arrives at your door. I'll send the driver's details and your registration number the day before. It's been a pleasure, Sharath — enjoy every kilometre.",
        ]}
        artifact={
          <CarSummaryCardLite
            title={BOOKING_CAR_TITLE}
            variant={BOOKING_CAR_VARIANT}
            colour={BOOKING_CAR_COLOR}
            deliveryLine={isPickup ? `Collect ${day} · ${windowSlot}` : `Arriving ${day} · ${windowSlot}`}
            dealerName={isPickup ? pickupName : dealer.name}
            dealerDetail={isPickup ? PICKUP_ADDRESS : dealer.detail}
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
        "Registered, insured, and ready to roll. Most people like to come collect it — pick a time and it's yours. Prefer your door? I can bring it instead.",
      ]}
      replies={replies}
      callLabel="Special instructions? I can call you"
    >
      <div className="flex flex-col gap-5 rounded-2xl bg-white card-elevated px-4 py-4">
        <ModeToggle mode={mode} onChange={setMode} />
        {isPickup ? <PickupLocationCard name={pickupName} /> : null}
        <SlotChips
          options={days}
          selected={day}
          onSelect={setDay}
          label={isPickup ? "Pick a day to collect" : "Pick a day"}
        />
        <SlotChips
          options={WINDOWS}
          selected={windowSlot}
          onSelect={setWindowSlot}
          label={isPickup ? "When will you arrive?" : "Pick a window"}
        />
      </div>
    </ConciergeTurnShell>
  );
}
