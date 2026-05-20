"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";

export type LoanProcessingWhatsNextVariant =
  | "processing"
  | "sanctioned"
  | "down_payment"
  | "down_payment_complete"
  /** Full payment — pay-full-payment hero; car payment in progress (no loan substeps). */
  | "full_payment"
  /** Full payment — car payment complete; car delivery prep active (no loan substeps). */
  | "full_payment_complete"
  /** Pay insurance premium — loan disbursement / full payment done; premium due under Car delivery. */
  | "insurance_premium_due"
  | "delivery_insurance_prep"
  /** Insurance issued; RTO registration in progress (next screen after insurance prep). */
  | "delivery_rto_prep"
  /** RTO complete; user picks delivery date (next screen after RTO prep). */
  | "delivery_schedule_prep"
  /** Self finance — `/payment/self-finance-action` (nested payment steps match loan-processing UX). */
  | "self_finance_action"
  /** Self finance — pay down payment screen; same nested steps as `self_finance_action` with progress through DP. */
  | "self_finance_down_payment"
  /** Self finance — full DP received; margin money slip download step in progress. */
  | "self_finance_margin_slip";

export type LoanProcessingWhatsNextProps = {
  /**
   * `down_payment` — pay next; `down_payment_complete` — DP done, loan disbursement next;
   * `insurance_premium_due` — disbursement / car payment done; insurance premium due next;
   * `delivery_insurance_prep` — policy issuing; `delivery_rto_prep` — RTO in progress;
   * `delivery_schedule_prep` — pick delivery slot; `self_finance_action` — self-arranged bank loan
   * checklist under Payment; `self_finance_down_payment` — same checklist with DP step in progress;
   * `self_finance_margin_slip` — DP complete; margin slip step active.
   * Payment rail is complete for all delivery_* variants.
   */
  variant?: LoanProcessingWhatsNextVariant;
  /**
   * Replaces the in-progress “Down payment” line when `variant` is `down_payment`, or the
   * “Downpayment” line when `variant` is `self_finance_down_payment`.
   * Example: “Pay ₹3,00,000 before 31 March”.
   */
  downPaymentInProgressDescription?: string;
  /**
   * Extra line under Payment on `full_payment` when there are no nested substeps (e.g. remaining due).
   */
  paymentInProgressDescription?: string;
  /**
   * Full-payment journey — payment step shows “paid in full” copy with no loan nested steps.
   * Set from `?bank=full_payment` on post-payment delivery screens.
   */
  fullPaymentJourney?: boolean;
  /**
   * Self-finance journey — payment nested steps use the self-finance checklist (not ACKO loan substeps).
   */
  selfFinanceJourney?: boolean;
};

/** Loan-style nested payment rail (skipped when `fullPaymentJourney` is true). */
function variantUsesLoanPaymentSubsteps(variant: LoanProcessingWhatsNextVariant): boolean {
  return (
    variant === "down_payment_complete" ||
    variant === "insurance_premium_due" ||
    variant === "delivery_insurance_prep" ||
    variant === "delivery_rto_prep" ||
    variant === "delivery_schedule_prep"
  );
}

type SubstepStatus = "done" | "in_progress" | "next";

type Substep = {
  status: SubstepStatus;
  title: string;
  description: string;
};

/** Active / completed connector (aligned with ACKO green accents in loan flow). */
const CONNECTOR_ACTIVE = "#138808";

/**
 * Nested substep column lines up with main-step title (spacer + gap only; no extra indent).
 * Vertical rail is centered on the 24px icon track (`left-3` + half-width translate).
 */
const NESTED_SUBSTEPS_CONTAINER_CLASS = "relative min-w-0 flex-1";
const NESTED_RAIL_LINE_BASE_CLASS =
  "pointer-events-none absolute left-3 z-0 w-px -translate-x-1/2";
const NESTED_SUBSTEP_ROW_CLASS = "grid grid-cols-[24px_1fr] items-start gap-x-3";

const PAYMENT_SUBTITLE = "You're financing your car through ACKO Drive.";

const FULL_PAYMENT_SUBTITLE = "You paid in full — no loan or EMI.";

const SELF_FINANCE_ACTION_PAYMENT_SUBTITLE =
  "Follow these steps to arrange financing with your bank.";

const SELF_FINANCE_ACTION_PAYMENT_SUBSTEPS: Substep[] = [
  {
    status: "in_progress",
    title: "Download proforma invoice",
    description: "Take this document to your bank to apply for the car loan.",
  },
  {
    status: "next",
    title: "Declare loan disbursement amount",
    description: "Tell us how much loan your bank approved.",
  },
  {
    status: "next",
    title: "Downpayment",
    description: "Pay your down payment through the app.",
  },
  {
    status: "next",
    title: "Download margin money slip",
    description: "Give this slip to your bank to release funds to the dealer.",
  },
  {
    status: "next",
    title: "Confirm disbursement from bank",
    description: "Share the payment reference number when your bank transfers the money.",
  },
];

/** Demo dates — aligned with Car allocation / self-finance journey copy. */
const SELF_FINANCE_PROFORMA_COMPLETED_ON = "2 Mar 2026";
const SELF_FINANCE_DECLARE_DISBURSEMENT_COMPLETED_ON = "15 Apr 2026";

const SELF_FINANCE_DOWN_PAYMENT_COMPLETED_ON = "20 Apr 2026";
const SELF_FINANCE_MARGIN_SLIP_COMPLETED_ON = "22 Apr 2026";

const SELF_FINANCE_PAYMENT_COMPLETE_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Download proforma invoice",
    description: `Completed on ${SELF_FINANCE_PROFORMA_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Declare loan disbursement amount",
    description: `Completed on ${SELF_FINANCE_DECLARE_DISBURSEMENT_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Downpayment",
    description: `Completed on ${SELF_FINANCE_DOWN_PAYMENT_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Download margin money slip",
    description: `Completed on ${SELF_FINANCE_MARGIN_SLIP_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Confirm disbursement from bank",
    description: "Bank transfer confirmed.",
  },
];

const SELF_FINANCE_DOWN_PAYMENT_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Download proforma invoice",
    description: `Completed on ${SELF_FINANCE_PROFORMA_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Declare loan disbursement amount",
    description: `Completed on ${SELF_FINANCE_DECLARE_DISBURSEMENT_COMPLETED_ON}.`,
  },
  {
    status: "in_progress",
    title: "Downpayment",
    description: "Pay your down payment through the app.",
  },
  {
    status: "next",
    title: "Download margin money slip",
    description: "Give this slip to your bank to release funds to the dealer.",
  },
  {
    status: "next",
    title: "Confirm disbursement from bank",
    description: "Share the payment reference number when your bank transfers the money.",
  },
];

const SELF_FINANCE_MARGIN_SLIP_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Download proforma invoice",
    description: `Completed on ${SELF_FINANCE_PROFORMA_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Declare loan disbursement amount",
    description: `Completed on ${SELF_FINANCE_DECLARE_DISBURSEMENT_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Downpayment",
    description: `Completed on ${SELF_FINANCE_DOWN_PAYMENT_COMPLETED_ON}.`,
  },
  {
    status: "in_progress",
    title: "Download margin money slip",
    description: "Give this slip to your bank to release funds to the dealer.",
  },
  {
    status: "next",
    title: "Confirm disbursement from bank",
    description: "Share the payment reference number when your bank transfers the money.",
  },
];

function paymentSectionSubtitle(variant: LoanProcessingWhatsNextVariant): string {
  if (variant === "full_payment" || variant === "full_payment_complete") {
    return FULL_PAYMENT_SUBTITLE;
  }
  if (
    variant === "self_finance_action" ||
    variant === "self_finance_down_payment" ||
    variant === "self_finance_margin_slip"
  ) {
    return SELF_FINANCE_ACTION_PAYMENT_SUBTITLE;
  }
  return PAYMENT_SUBTITLE;
}

/** Aligns with `WhatsNextTimeline` / KYC booking — first journey step before payment (done). */
const CAR_ALLOCATION_TITLE = "Car allocation";

/** Completion dates shown on done substeps (past tense titles + dated subtext). */
const CAR_ALLOCATION_COMPLETED_ON = "1 Mar 2026";
const CAR_ALLOCATION_DESCRIPTION = `Completed on ${CAR_ALLOCATION_COMPLETED_ON}.`;

const DOCS_COMPLETED_ON = "5 Apr 2025";
const LOAN_PROCESSED_ON = "8 Apr 2025";
const CHOOSE_LOAN_COMPLETED_ON = "19 Apr 2026";

const PROCESSING_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Documents uploaded",
    description: `Completed on ${DOCS_COMPLETED_ON}.`,
  },
  {
    status: "in_progress",
    title: "Loan processing",
    description: "Your loan application will be reviewed by the bank.",
  },
  {
    status: "next",
    title: "Choose loan amount",
    description: "Select your loan amount to see the required down payment.",
  },
  {
    status: "next",
    title: "Down payment",
    description: "Pay the required down payment to continue.",
  },
  {
    status: "next",
    title: "Loan disbursement",
    description:
      "The bank will disburse the loan amount to the dealership after your down payment is completed.",
  },
];

const SANCTIONED_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Documents uploaded",
    description: `Completed on ${DOCS_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Loan processed",
    description: `Completed on ${LOAN_PROCESSED_ON}.`,
  },
  {
    status: "in_progress",
    title: "Choose loan amount",
    description: "Select your loan amount to see the required down payment.",
  },
  {
    status: "next",
    title: "Down payment",
    description: "Pay the required down payment to continue.",
  },
  {
    status: "next",
    title: "Loan disbursement",
    description:
      "The bank will disburse the loan amount to the dealership after your down payment is completed.",
  },
];

const DOWN_PAYMENT_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Documents uploaded",
    description: `Completed on ${DOCS_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Loan processed",
    description: `Completed on ${LOAN_PROCESSED_ON}.`,
  },
  {
    status: "done",
    title: "Choose loan amount",
    description: `Completed on ${CHOOSE_LOAN_COMPLETED_ON}.`,
  },
  {
    status: "in_progress",
    title: "Down payment",
    description: "Pay the required down payment before 31 March",
  },
  {
    status: "next",
    title: "Loan disbursement",
    description:
      "The bank will disburse the loan amount to the dealership after your down payment is completed.",
  },
];

/** After full down payment — DP step done; loan disbursement queued / next. */
const DOWN_PAYMENT_COMPLETE_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Documents uploaded",
    description: `Completed on ${DOCS_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Loan processed",
    description: `Completed on ${LOAN_PROCESSED_ON}.`,
  },
  {
    status: "done",
    title: "Choose loan amount",
    description: `Completed on ${CHOOSE_LOAN_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Down payment",
    description: "Your down payment is received.",
  },
  {
    status: "in_progress",
    title: "Loan disbursement",
    description:
      "The bank will disburse the loan to the dealership shortly. We'll notify you when it's done.",
  },
];

/** After disbursement — all Payment substeps complete (insurance moves under Car delivery). */
const DELIVERY_INSURANCE_PREP_PAYMENT_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Documents uploaded",
    description: `Completed on ${DOCS_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Loan processed",
    description: `Completed on ${LOAN_PROCESSED_ON}.`,
  },
  {
    status: "done",
    title: "Choose loan amount",
    description: `Completed on ${CHOOSE_LOAN_COMPLETED_ON}.`,
  },
  {
    status: "done",
    title: "Down payment",
    description: "Your down payment is received.",
  },
  {
    status: "done",
    title: "Loan disbursement",
    description: "The loan has been disbursed to the dealership.",
  },
];

/** Nested under “Car delivery” on pay-insurance-premium (premium not yet paid). */
const CAR_DELIVERY_INSURANCE_PREMIUM_DUE_SUBSTEPS: Substep[] = [
  {
    status: "in_progress",
    title: "Insurance premium",
    description: "Pay to activate your Zero Dep policy before delivery.",
  },
  {
    status: "next",
    title: "RTO registration",
    description:
      "Your car will be registered with RTO and you'll get your car number.",
  },
  {
    status: "next",
    title: "Select delivery date",
    description: "You can schedule your car delivery.",
  },
];

/** Nested under “Car delivery” for `delivery_insurance_prep` (policy issuing first). */
const CAR_DELIVERY_PREP_SUBSTEPS: Substep[] = [
  {
    status: "in_progress",
    title: "Insurance in progress",
    description: "Your policy is being issued.",
  },
  {
    status: "next",
    title: "RTO registration",
    description:
      "Your car will be registered with RTO and you'll get your car number.",
  },
  {
    status: "next",
    title: "Select delivery date",
    description: "You can schedule your car delivery.",
  },
];

/** After insurance is issued — RTO is the active delivery substep. */
const CAR_DELIVERY_RTO_PREP_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Car insurance",
    description: "Your Zero Dep policy has been issued.",
  },
  {
    status: "in_progress",
    title: "RTO registration",
    description:
      "Your car will be registered with RTO and you'll get your car number.",
  },
  {
    status: "next",
    title: "Select delivery date",
    description: "You can schedule your car delivery.",
  },
];

/** After RTO — user schedules handoff. */
const CAR_DELIVERY_SCHEDULE_PREP_SUBSTEPS: Substep[] = [
  {
    status: "done",
    title: "Car insurance",
    description: "Your Zero Dep policy has been issued.",
  },
  {
    status: "done",
    title: "RTO registration",
    description: "Your car number has been allotted.",
  },
  {
    status: "in_progress",
    title: "Select delivery date",
    description: "Choose a slot for your car delivery.",
  },
];

const CAR_DELIVERY_SUBTITLE = "Estimated delivery by 2 Mar 2026";

function carDeliveryNestedSubsteps(
  variant: LoanProcessingWhatsNextVariant,
): Substep[] | null {
  switch (variant) {
    case "full_payment_complete":
    case "insurance_premium_due":
    case "delivery_insurance_prep":
      return variant === "insurance_premium_due"
        ? CAR_DELIVERY_INSURANCE_PREMIUM_DUE_SUBSTEPS
        : CAR_DELIVERY_PREP_SUBSTEPS;
    case "delivery_rto_prep":
      return CAR_DELIVERY_RTO_PREP_SUBSTEPS;
    case "delivery_schedule_prep":
      return CAR_DELIVERY_SCHEDULE_PREP_SUBSTEPS;
    default:
      return null;
  }
}

function substepsForVariant(
  variant: LoanProcessingWhatsNextVariant,
  selfFinanceJourney = false,
): Substep[] {
  if (variant === "self_finance_margin_slip") return SELF_FINANCE_MARGIN_SLIP_SUBSTEPS;
  if (variant === "self_finance_down_payment") return SELF_FINANCE_DOWN_PAYMENT_SUBSTEPS;
  if (variant === "self_finance_action") return SELF_FINANCE_ACTION_PAYMENT_SUBSTEPS;
  if (variant === "sanctioned") return SANCTIONED_SUBSTEPS;
  if (variant === "down_payment") return DOWN_PAYMENT_SUBSTEPS;
  if (variant === "down_payment_complete") return DOWN_PAYMENT_COMPLETE_SUBSTEPS;
  if (variant === "full_payment" || variant === "full_payment_complete") return [];
  if (
    variant === "delivery_insurance_prep" ||
    variant === "delivery_rto_prep" ||
    variant === "delivery_schedule_prep" ||
    variant === "insurance_premium_due"
  ) {
    return selfFinanceJourney
      ? SELF_FINANCE_PAYMENT_COMPLETE_SUBSTEPS
      : DELIVERY_INSURANCE_PREP_PAYMENT_SUBSTEPS;
  }
  return PROCESSING_SUBSTEPS;
}

function mainStageStatuses(variant: LoanProcessingWhatsNextVariant): {
  payment: SubstepStatus;
  carDelivery: SubstepStatus;
} {
  if (
    variant === "full_payment_complete" ||
    variant === "insurance_premium_due" ||
    variant === "delivery_insurance_prep" ||
    variant === "delivery_rto_prep" ||
    variant === "delivery_schedule_prep"
  ) {
    return { payment: "done", carDelivery: "in_progress" };
  }
  return { payment: "in_progress", carDelivery: "next" };
}

/** Top-level stages — `in_progress` → title weight 500; `done` / `next` → 400. */
const MAIN_CAR_ALLOCATION_STATUS: SubstepStatus = "done";

function stageTitleWeightClass(status: SubstepStatus) {
  return status === "in_progress" ? "font-medium" : "font-normal";
}

function StepStatusIcon({ status }: { status: SubstepStatus }) {
  const src =
    status === "done"
      ? KYC_ASSETS.timelineDone
      : status === "in_progress"
        ? KYC_ASSETS.timelineInProgress
        : KYC_ASSETS.timelineNext;
  const label =
    status === "done" ? "Completed" : status === "in_progress" ? "In progress" : "Pending";

  return (
    <span
      className="relative flex h-6 w-6 shrink-0 items-center justify-center"
      title={label}
      aria-hidden
    >
      <Image src={src} alt="" fill className="object-contain" unoptimized sizes="24px" />
    </span>
  );
}

type LineSeg = { top: number; height: number };

const EMPTY_LINE: LineSeg = { top: 0, height: 0 };

function computeNestedRailLines(
  steps: Substep[],
  icons: (HTMLDivElement | null)[],
  nestedEl: HTMLDivElement,
): { green: LineSeg; grey: LineSeg } {
  const lastIdx = steps.length - 1;
  if (lastIdx < 0 || !icons[0] || !icons[lastIdx]) {
    return { green: EMPTY_LINE, grey: EMPTY_LINE };
  }

  const nr = nestedEl.getBoundingClientRect();
  const midY = (el: HTMLDivElement) => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2 - nr.top;
  };
  const y = (i: number) => midY(icons[i]!);

  let splitIdx = steps.findIndex((s) => s.status === "in_progress");
  if (splitIdx < 0 && steps.every((s) => s.status === "done")) {
    splitIdx = lastIdx;
  }
  if (splitIdx < 0 || !icons[splitIdx]) {
    return { green: EMPTY_LINE, grey: EMPTY_LINE };
  }

  return {
    green: { top: y(0), height: Math.max(0, y(splitIdx) - y(0)) },
    grey: { top: y(splitIdx), height: Math.max(0, y(lastIdx) - y(splitIdx)) },
  };
}

/**
 * Expandable “What’s next” for loan flows (processing, sanctioned, pay-down-payment, delivery prep,
 * self finance action): main rail Car allocation → Payment (nested substeps) → Car delivery (optional nested substeps).
 */
export function LoanProcessingWhatsNext({
  variant = "processing",
  downPaymentInProgressDescription,
  paymentInProgressDescription,
  fullPaymentJourney = false,
  selfFinanceJourney = false,
}: LoanProcessingWhatsNextProps) {
  const { payment: mainPaymentStatus, carDelivery: mainCarDeliveryStatus } = useMemo(
    () => mainStageStatuses(variant),
    [variant],
  );

  const paymentSubtitle = useMemo(() => {
    if (fullPaymentJourney) return FULL_PAYMENT_SUBTITLE;
    if (selfFinanceJourney) return SELF_FINANCE_ACTION_PAYMENT_SUBTITLE;
    return paymentSectionSubtitle(variant);
  }, [fullPaymentJourney, selfFinanceJourney, variant]);

  const substeps = useMemo(() => {
    const base =
      fullPaymentJourney && variantUsesLoanPaymentSubsteps(variant)
        ? []
        : substepsForVariant(variant, selfFinanceJourney);
    if (variant === "down_payment" && downPaymentInProgressDescription) {
      return base.map((s) =>
        s.title === "Down payment" && s.status === "in_progress"
          ? { ...s, description: downPaymentInProgressDescription }
          : s,
      );
    }
    if (variant === "self_finance_down_payment" && downPaymentInProgressDescription) {
      return base.map((s) =>
        s.title === "Downpayment" && s.status === "in_progress"
          ? { ...s, description: downPaymentInProgressDescription }
          : s,
      );
    }
    return base;
  }, [variant, downPaymentInProgressDescription, fullPaymentJourney, selfFinanceJourney]);

  const deliveryNestedSteps = useMemo(() => carDeliveryNestedSubsteps(variant), [variant]);

  const showPaymentNested = substeps.length > 0;
  const showCarDeliveryNested = deliveryNestedSteps != null;

  /** Defaults: in-progress main step open, done main step closed; user can toggle. */
  const [paymentExpanded, setPaymentExpanded] = useState(
    () => mainPaymentStatus === "in_progress",
  );
  const [deliveryExpanded, setDeliveryExpanded] = useState(
    () => showCarDeliveryNested && mainCarDeliveryStatus === "in_progress",
  );

  useEffect(() => {
    setPaymentExpanded(mainPaymentStatus === "in_progress");
    setDeliveryExpanded(showCarDeliveryNested && mainCarDeliveryStatus === "in_progress");
  }, [variant]);

  const rootRef = useRef<HTMLDivElement>(null);
  const allocationIconRef = useRef<HTMLDivElement>(null);
  const payIconRef = useRef<HTMLDivElement>(null);
  const carIconRef = useRef<HTMLDivElement>(null);
  const nestedRef = useRef<HTMLDivElement>(null);
  const subIconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const deliveryNestedRef = useRef<HTMLDivElement>(null);
  const deliverySubIconRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [mainRailGreen, setMainRailGreen] = useState<LineSeg>(EMPTY_LINE);
  const [mainRailGrey, setMainRailGrey] = useState<LineSeg>(EMPTY_LINE);
  const [innerGreen, setInnerGreen] = useState<LineSeg>(EMPTY_LINE);
  const [innerGrey, setInnerGrey] = useState<LineSeg>(EMPTY_LINE);
  const [deliveryInnerGreen, setDeliveryInnerGreen] = useState<LineSeg>(EMPTY_LINE);
  const [deliveryInnerGrey, setDeliveryInnerGrey] = useState<LineSeg>(EMPTY_LINE);

  const updateConnectors = useCallback(() => {
    const steps = substeps;
    const stepCount = steps.length;

    const root = rootRef.current;
    const alloc = allocationIconRef.current;
    const pay = payIconRef.current;
    const car = carIconRef.current;
    if (!root || !alloc || !pay || !car) {
      setMainRailGreen(EMPTY_LINE);
      setMainRailGrey(EMPTY_LINE);
      setInnerGreen(EMPTY_LINE);
      setInnerGrey(EMPTY_LINE);
      setDeliveryInnerGreen(EMPTY_LINE);
      setDeliveryInnerGrey(EMPTY_LINE);
      return;
    }

    const rr = root.getBoundingClientRect();
    const allocR = alloc.getBoundingClientRect();
    const payR = pay.getBoundingClientRect();
    const carR = car.getBoundingClientRect();
    const allocCy = allocR.top + allocR.height / 2 - rr.top;
    const payCy = payR.top + payR.height / 2 - rr.top;
    const carCy = carR.top + carR.height / 2 - rr.top;

    const y = [allocCy, payCy, carCy] as const;
    const { payment: s1, carDelivery: s2 } = mainStageStatuses(variant);
    const statuses: SubstepStatus[] = [MAIN_CAR_ALLOCATION_STATUS, s1, s2];

    let splitIdx = statuses.findIndex((s) => s === "in_progress");
    if (splitIdx < 0) {
      if (statuses.every((s) => s === "done")) {
        splitIdx = 2;
      } else {
        splitIdx = 1;
      }
    }

    setMainRailGreen({ top: y[0], height: Math.max(0, y[splitIdx] - y[0]) });
    setMainRailGrey({ top: y[splitIdx], height: Math.max(0, y[2] - y[splitIdx]) });

    if (!paymentExpanded) {
      setInnerGreen(EMPTY_LINE);
      setInnerGrey(EMPTY_LINE);
    } else {
      const nested = nestedRef.current;
      const icons = subIconRefs.current;
      const lastIdx = stepCount - 1;
      if (!nested || lastIdx < 0 || !icons[0] || !icons[lastIdx]) {
        setInnerGreen(EMPTY_LINE);
        setInnerGrey(EMPTY_LINE);
      } else {
        const { green, grey } = computeNestedRailLines(steps, icons, nested);
        setInnerGreen(green);
        setInnerGrey(grey);
      }
    }

    const dSteps = carDeliveryNestedSubsteps(variant);
    if (!dSteps || !deliveryExpanded) {
      setDeliveryInnerGreen(EMPTY_LINE);
      setDeliveryInnerGrey(EMPTY_LINE);
    } else {
      const dn = deliveryNestedRef.current;
      const dIcons = deliverySubIconRefs.current;
      const dLast = dSteps.length - 1;
      if (!dn || dLast < 0 || !dIcons[0] || !dIcons[dLast]) {
        setDeliveryInnerGreen(EMPTY_LINE);
        setDeliveryInnerGrey(EMPTY_LINE);
      } else {
        const { green, grey } = computeNestedRailLines(dSteps, dIcons, dn);
        setDeliveryInnerGreen(green);
        setDeliveryInnerGrey(grey);
      }
    }
  }, [paymentExpanded, deliveryExpanded, substeps, variant]);

  useLayoutEffect(() => {
    updateConnectors();
  }, [updateConnectors]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => updateConnectors());
    ro.observe(root);
    window.addEventListener("resize", updateConnectors);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateConnectors);
    };
  }, [updateConnectors]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(updateConnectors);
    });
    return () => window.cancelAnimationFrame(id);
  }, [paymentExpanded, deliveryExpanded, substeps, variant, updateConnectors]);

  const togglePayment = useCallback(() => {
    setPaymentExpanded((v) => !v);
  }, []);

  const toggleDelivery = useCallback(() => {
    setDeliveryExpanded((v) => !v);
  }, []);

  return (
    <div ref={rootRef} className="relative">
        {mainRailGreen.height > 0 ? (
          <div
            className="pointer-events-none absolute left-3 z-0 w-px -translate-x-1/2"
            style={{
              top: mainRailGreen.top,
              height: mainRailGreen.height,
              backgroundColor: CONNECTOR_ACTIVE,
            }}
            aria-hidden
          />
        ) : null}
        {mainRailGrey.height > 0 ? (
          <div
            className="pointer-events-none absolute left-3 z-0 w-px -translate-x-1/2 bg-[#e8e8e8]"
            style={{ top: mainRailGrey.top, height: mainRailGrey.height }}
            aria-hidden
          />
        ) : null}

        <div className="relative z-[1] flex gap-3">
          <div
            ref={allocationIconRef}
            className="relative mt-0.5 flex h-6 w-6 shrink-0 justify-center bg-white"
          >
            <StepStatusIcon status={MAIN_CAR_ALLOCATION_STATUS} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(MAIN_CAR_ALLOCATION_STATUS)}`}
            >
              {CAR_ALLOCATION_TITLE}
            </p>
            <p className="mt-1 text-xs leading-[18px] text-[#757575]">{CAR_ALLOCATION_DESCRIPTION}</p>
          </div>
        </div>

        <div className="relative z-[1] my-4 flex gap-3" role="presentation">
          <div className="w-6 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 border-t border-solid border-[#e8e8e8]" role="separator" />
        </div>

        {showPaymentNested ? (
          <button
            type="button"
            className="relative z-[1] flex w-full items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            onClick={togglePayment}
          aria-expanded={paymentExpanded}
          aria-controls="loan-payment-substeps"
          id="loan-payment-section-toggle"
        >
          <div
            ref={payIconRef}
            className="relative mt-0.5 flex h-6 w-6 shrink-0 justify-center bg-white"
          >
            <StepStatusIcon status={mainPaymentStatus} />
          </div>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span
                className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(mainPaymentStatus)}`}
              >
                Payment
              </span>
              <span className="relative mt-0.5 h-5 w-5 shrink-0 text-[#121212]" aria-hidden>
                <Image
                  src={KYC_ASSETS.chevronRight}
                  alt=""
                  aria-hidden
                  width={20}
                  height={20}
                  className={`block h-5 w-5 object-contain transition-transform duration-200 ease-out ${
                    paymentExpanded ? "-rotate-90" : "rotate-90"
                  }`}
                  unoptimized
                />
              </span>
            </span>
            <p className="mt-1 text-xs leading-[18px] text-[#757575]">{paymentSubtitle}</p>
          </span>
          </button>
        ) : (
          <div className="relative z-[1] flex gap-3">
            <div
              ref={payIconRef}
              className="relative mt-0.5 flex h-6 w-6 shrink-0 justify-center bg-white"
            >
              <StepStatusIcon status={mainPaymentStatus} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(mainPaymentStatus)}`}
              >
                Payment
              </p>
              <p className="mt-1 text-xs leading-[18px] text-[#757575]">{paymentSubtitle}</p>
              {paymentInProgressDescription ? (
                <p className="mt-1 text-xs leading-[18px] text-[#757575]">
                  {paymentInProgressDescription}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {showPaymentNested && paymentExpanded ? (
          <div className="relative z-[1] mt-4 flex gap-3">
            <div className="mt-0.5 w-6 shrink-0 bg-transparent" aria-hidden />
            <div ref={nestedRef} className={NESTED_SUBSTEPS_CONTAINER_CLASS}>
              {innerGreen.height > 0 ? (
                <div
                  className={NESTED_RAIL_LINE_BASE_CLASS}
                  style={{
                    top: innerGreen.top,
                    height: innerGreen.height,
                    backgroundColor: CONNECTOR_ACTIVE,
                  }}
                  aria-hidden
                />
              ) : null}
              {innerGrey.height > 0 ? (
                <div
                  className={`${NESTED_RAIL_LINE_BASE_CLASS} bg-[#e8e8e8]`}
                  style={{ top: innerGrey.top, height: innerGrey.height }}
                  aria-hidden
                />
              ) : null}
              <ul
                id="loan-payment-substeps"
                className="relative z-[1] m-0 list-none p-0"
                role="region"
                aria-labelledby="loan-payment-section-toggle"
              >
                {substeps.map((step, index) => (
                  <li
                    key={step.title}
                    className={`${NESTED_SUBSTEP_ROW_CLASS} ${index > 0 ? "mt-4" : ""}`}
                  >
                    <div
                      ref={(el) => {
                        subIconRefs.current[index] = el;
                      }}
                      className="relative z-[1] flex h-6 w-6 shrink-0 justify-center bg-white pt-0.5"
                    >
                      <StepStatusIcon status={step.status} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(step.status)}`}
                      >
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-[18px] text-[#757575]">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="relative z-[1] my-4 flex gap-3" role="presentation">
          <div className="w-6 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 border-t border-solid border-[#e8e8e8]" role="separator" />
        </div>

        {showCarDeliveryNested ? (
          <>
            <button
              type="button"
              className="relative z-[1] flex w-full items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
              onClick={toggleDelivery}
              aria-expanded={deliveryExpanded}
              aria-controls="loan-car-delivery-substeps"
              id="loan-car-delivery-section-toggle"
            >
              <div
                ref={carIconRef}
                className="relative mt-0.5 flex h-6 w-6 shrink-0 justify-center bg-white"
              >
                <StepStatusIcon status={mainCarDeliveryStatus} />
              </div>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span
                    className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(mainCarDeliveryStatus)}`}
                  >
                    Car delivery
                  </span>
                  <span className="relative mt-0.5 h-5 w-5 shrink-0 text-[#121212]" aria-hidden>
                    <Image
                      src={KYC_ASSETS.chevronRight}
                      alt=""
                      aria-hidden
                      width={20}
                      height={20}
                      className={`block h-5 w-5 object-contain transition-transform duration-200 ease-out ${
                        deliveryExpanded ? "-rotate-90" : "rotate-90"
                      }`}
                      unoptimized
                    />
                  </span>
                </span>
                <p className="mt-1 text-xs leading-[18px] text-[#757575]">{CAR_DELIVERY_SUBTITLE}</p>
              </span>
            </button>

            {deliveryExpanded ? (
              <div className="relative z-[1] mt-4 flex gap-3">
                <div className="mt-0.5 w-6 shrink-0 bg-transparent" aria-hidden />
                <div ref={deliveryNestedRef} className={NESTED_SUBSTEPS_CONTAINER_CLASS}>
                  {deliveryInnerGreen.height > 0 ? (
                    <div
                      className={NESTED_RAIL_LINE_BASE_CLASS}
                      style={{
                        top: deliveryInnerGreen.top,
                        height: deliveryInnerGreen.height,
                        backgroundColor: CONNECTOR_ACTIVE,
                      }}
                      aria-hidden
                    />
                  ) : null}
                  {deliveryInnerGrey.height > 0 ? (
                    <div
                      className={`${NESTED_RAIL_LINE_BASE_CLASS} bg-[#e8e8e8]`}
                      style={{
                        top: deliveryInnerGrey.top,
                        height: deliveryInnerGrey.height,
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <ul
                    id="loan-car-delivery-substeps"
                    className="relative z-[1] m-0 list-none p-0"
                    role="region"
                    aria-labelledby="loan-car-delivery-section-toggle"
                  >
                    {deliveryNestedSteps!.map((step, index) => (
                      <li
                        key={step.title}
                        className={`${NESTED_SUBSTEP_ROW_CLASS} ${index > 0 ? "mt-4" : ""}`}
                      >
                        <div
                          ref={(el) => {
                            deliverySubIconRefs.current[index] = el;
                          }}
                          className="relative z-[1] flex h-6 w-6 shrink-0 justify-center bg-white pt-0.5"
                        >
                          <StepStatusIcon status={step.status} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(step.status)}`}
                          >
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-[18px] text-[#757575]">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="relative z-[1] flex gap-3">
            <div
              ref={carIconRef}
              className="relative mt-0.5 flex h-6 w-6 shrink-0 justify-center bg-white"
            >
              <StepStatusIcon status={mainCarDeliveryStatus} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm leading-5 text-[#121212] ${stageTitleWeightClass(mainCarDeliveryStatus)}`}
              >
                Car delivery
              </p>
              <p className="mt-1 text-xs leading-[18px] text-[#757575]">{CAR_DELIVERY_SUBTITLE}</p>
            </div>
          </div>
        )}
    </div>
  );
}
