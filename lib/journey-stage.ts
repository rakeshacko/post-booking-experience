import {
  getBookingDeliveryLine,
  splitBookingDeliveryLine,
} from "@/lib/experience-flow-content";
import type { ExperienceFlow } from "@/lib/experience-flow";
import { normalizeAppPathname } from "@/lib/journey-routes";

/**
 * The four chapters of the journey — one source of truth for the purchase-state
 * layer (timeline, receipts) and the delivery-date pill.
 */
export type PlanStepStatus = "done" | "now" | "todo";

export type JourneyStageStep = {
  icon: "documents" | "car" | "money" | "delivery";
  title: string;
  detail: string;
  status: PlanStepStatus;
};

/** 0 paperwork · 1 exact car · 2 money · 3 delivery. */
export function resolveJourneyStageIndex(pathname: string): number {
  const path = normalizeAppPathname(pathname);
  if (path.includes("car-delivery") || path.includes("insurance")) return 3;
  if (path === "/payment/booking-success") return 0;
  if (path.startsWith("/payment")) return 2;
  if (
    path.startsWith("/car-allocation") ||
    path === "/kyc/processing" ||
    path === "/kyc/booking-accepted" ||
    path === "/kyc/booking-confirmed"
  ) {
    return 1;
  }
  return 0;
}

/** Short date for the pill — “10 Jun” / “25 Oct”. */
export function getDeliveryDateShort(flow?: ExperienceFlow): string {
  const date = splitBookingDeliveryLine(getBookingDeliveryLine(flow))?.date ?? "";
  return date.replace(/\s*'\d+$/, "");
}

/** Full date for the layer hero — “10 Jun '25”. */
export function getDeliveryDateFull(flow?: ExperienceFlow): string {
  return splitBookingDeliveryLine(getBookingDeliveryLine(flow))?.date ?? "";
}

type StepCopy = {
  icon: JourneyStageStep["icon"];
  title: string;
  /** The promise ledger lives in these lines — promised vs kept per status. */
  done: string;
  now: string;
  todo: string;
};

const STEP_COPY: readonly StepCopy[] = [
  {
    icon: "documents",
    title: "Paperwork",
    done: "Promised two minutes — verified in seconds",
    now: "Two minutes from you — Shivi files the rest",
    todo: "PAN and Aadhaar open the purchase in your name",
  },
  {
    icon: "car",
    title: "Your exact car",
    done: "Promised by morning — locked the same day",
    now: "Dealer news promised by tomorrow morning",
    todo: "Shivi reserves your variant and colour with a dealer",
  },
  {
    icon: "money",
    title: "The money plan",
    done: "Set — every receipt is saved below",
    now: "Your delivery date locks the moment this is set",
    todo: "Finance through Shivi or your own way — your pick",
  },
  {
    icon: "delivery",
    title: "To your door",
    done: "Scheduled — driver details land the day before",
    now: "Insurance, RTO, then your doorstep",
    todo: "", // filled with the live delivery line below
  },
] as const;

/** Timeline for the purchase-state layer, with the promise ledger in the details. */
export function getJourneyStageSteps(
  pathname: string,
  flow?: ExperienceFlow,
): JourneyStageStep[] {
  const stage = resolveJourneyStageIndex(pathname);
  return STEP_COPY.map((step, idx) => {
    const status: PlanStepStatus = idx < stage ? "done" : idx === stage ? "now" : "todo";
    const detail =
      status === "done"
        ? step.done
        : status === "now"
          ? step.now
          : step.todo || getBookingDeliveryLine(flow);
    return { icon: step.icon, title: step.title, detail, status };
  });
}

export type JourneyReceipt = {
  title: string;
  meta: string;
};

/** Paper trail by stage — what exists so far, oldest first. */
export function getJourneyReceipts(pathname: string): JourneyReceipt[] {
  const stage = resolveJourneyStageIndex(pathname);
  const receipts: JourneyReceipt[] = [
    { title: "Price-lock receipt", meta: "₹10,000 · paid" },
  ];
  if (stage >= 2) {
    receipts.push(
      { title: "Reservation confirmation", meta: "Advaith Hyundai" },
      { title: "Allocation certificate", meta: "Engine & chassis no." },
      { title: "Proforma invoice", meta: "On-road price breakup" },
    );
  }
  if (stage >= 3) {
    receipts.push({ title: "Insurance policy", meta: "ACKO Drive Shield · zero dep" });
  }
  return receipts;
}
