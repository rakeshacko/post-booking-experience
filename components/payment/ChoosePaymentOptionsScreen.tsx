"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ConciergeTurnShell } from "@/components/concierge/ConciergeTurnShell";
import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { writeConciergeEcho } from "@/lib/concierge/echo";
import { BankSelectionBottomSheet } from "@/components/payment/BankSelectionBottomSheet";
import { FullPaymentConfirmBottomSheet } from "@/components/payment/FullPaymentConfirmBottomSheet";
import { SelfFinanceConfirmBottomSheet } from "@/components/payment/SelfFinanceConfirmBottomSheet";
import {
  BANK_DISBURSEMENT_INR,
  DEFAULT_TENURE_MONTHS,
  FULL_PAYMENT_CAR_AMOUNT_INR,
} from "@/components/payment/loan-amount-demo-constants";
import {
  BANK_SHEET_OPTIONS,
  PARTNER_BANK_LOGOS,
  PAYMENT_CHOOSE_ASSETS,
} from "@/components/payment/payment-choose-assets";
import { estimateMonthlyEmiInr, parseAnnualRateFromLabel } from "@/lib/loan-emi";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/** Best partner-bank rate — the honest “EMI from” number on the fork. */
const BEST_PARTNER_RATE = Math.min(
  ...BANK_SHEET_OPTIONS.map((bank) => parseAnnualRateFromLabel(bank.rate)),
);

const ACKO_EMI_FROM_INR = estimateMonthlyEmiInr(
  BANK_DISBURSEMENT_INR,
  DEFAULT_TENURE_MONTHS,
  BEST_PARTNER_RATE,
);

/** Stagger between option cards once the artifact reveals (`payment-success-stagger` in globals). */
const STAGGER_OPTION_STEP_MS = 115;

type PaymentOptionId = "acko_drive" | "self_finance" | "full_payment";

function RadioIndicator({ selected }: { selected: boolean }) {
  const src = selected ? PAYMENT_CHOOSE_ASSETS.radioOn : PAYMENT_CHOOSE_ASSETS.radioOff;
  return (
    <span className="relative h-4 w-4 shrink-0" aria-hidden>
      <Image src={src} alt="" fill className="object-contain" unoptimized sizes="16px" />
    </span>
  );
}

type OptionStat = {
  value: string;
  caption: string;
};

/** Auto-advance cadence for the how-it-works slideshow. */
const FLOW_SLIDE_MS = 2200;

/**
 * “How it works” as a one-line slideshow — steps cycle one at a time with
 * position dots, inside a fixed-height strip so nothing jumps. Runs only on
 * the selected card.
 */
function FlowStrip({
  steps,
  active,
  bankLogosOnStep,
}: {
  steps: readonly string[];
  active: boolean;
  /** Show partner-bank marks beside this step (e.g. “You pick the bank”). */
  bankLogosOnStep?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!active) {
      setIdx(0);
      return;
    }
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % steps.length),
      reduceMotion ? FLOW_SLIDE_MS + 1300 : FLOW_SLIDE_MS,
    );
    return () => window.clearInterval(id);
  }, [active, steps.length, reduceMotion]);

  return (
    <div className="flex h-5 items-center gap-3" aria-label="How it works">
      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          key={idx}
          className={`flex items-center gap-2 ${reduceMotion ? "" : "kyc-stagger"}`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#efe9fb] text-[10px] font-semibold leading-none text-[#5920c5]">
            {idx + 1}
          </span>
          <span className="min-w-0 truncate text-xs leading-5 text-[#4b4b4b]">{steps[idx]}</span>
          {bankLogosOnStep === idx ? (
            <span className="flex shrink-0 items-center gap-1">
              {PARTNER_BANK_LOGOS.map((bank) => (
                <span key={bank.alt} className="relative h-4 w-4" title={bank.alt}>
                  <Image
                    src={bank.src}
                    alt={bank.alt}
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="16px"
                  />
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1" aria-hidden>
        {steps.map((step, i) => (
          <span
            key={step}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === idx ? "w-3 bg-[#5920c5]" : "w-1 bg-[#d9d8de]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type OptionCardProps = {
  id: PaymentOptionId;
  selected: boolean;
  onSelect: () => void;
  illustrationSrc: string;
  title: string;
  /** One-word positioning — “Easiest” / “Most control” / “Fastest”. */
  chip?: string;
  /** One sentence, Shivi's voice — what this path actually means for you. */
  blurb: string;
  /** The deciding numbers — visible before any tap. */
  stats: readonly OptionStat[];
  /** Micro process steps — slideshow in a thin strip when the card is selected. */
  flow: readonly string[];
  /** Show partner-bank marks beside this flow step. */
  flowBankLogosOnStep?: number;
};

function OptionCard({
  id,
  selected,
  onSelect,
  illustrationSrc,
  title,
  chip,
  blurb,
  stats,
  flow,
  flowBankLogosOnStep,
}: OptionCardProps) {
  return (
    <button
      type="button"
      id={`payment-option-${id}`}
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-2xl border p-[15px] text-left transition-colors card-elevated ${
        selected
          ? "border-[#bda6e8] bg-white bg-[linear-gradient(to_bottom,#f4eefe,rgba(244,238,254,0))]"
          : "border-transparent bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 self-center">
          <Image
            src={illustrationSrc}
            alt=""
            fill
            className="object-contain"
            unoptimized
            sizes="40px"
          />
        </div>
        {/* Uniform two-line lockup (title, chip) so every card's header is the same height. */}
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-6 text-[#121212]">{title}</p>
          {chip ? (
            <span className="mt-1 inline-flex rounded-full bg-[#efe9fb] px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.06em] text-[#5920c5]">
              {chip}
            </span>
          ) : null}
        </div>
        <span className="mt-1 flex shrink-0">
          <RadioIndicator selected={selected} />
        </span>
      </div>

      <p className="mt-2.5 text-[13px] leading-[19px] text-[#4b4b4b]">{blurb}</p>

      <div className="mt-3 flex">
        {stats.map((stat, idx) => (
          <div
            key={stat.caption}
            className={
              idx > 0 ? "ml-4 min-w-0 border-l border-[#ececec] pl-4" : "min-w-0"
            }
          >
            <p className="text-sm font-semibold leading-5 text-[#121212] tabular-nums">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-[#757575]">{stat.caption}</p>
          </div>
        ))}
      </div>

      {/* Selected → the thin how-it-works strip expands; collapsed cards stay compact. */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
          selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!selected}
      >
        <div className="overflow-hidden">
          <div className="mt-3 border-t border-dashed border-[#dcdbe1] pt-3">
            <FlowStrip steps={flow} active={selected} bankLogosOnStep={flowBankLogosOnStep} />
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Choose payment option — the money fork, as a Shivi turn: the remaining
 * amount anchors the question, the three paths are the artifact, the reply
 * adapts to the selection.
 */
export function ChoosePaymentOptionsScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<PaymentOptionId>("acko_drive");
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const [selfFinanceConfirmOpen, setSelfFinanceConfirmOpen] = useState(false);
  const [fullPaymentConfirmOpen, setFullPaymentConfirmOpen] = useState(false);

  const onContinue = useCallback(() => {
    if (choice === "acko_drive") {
      setBankSheetOpen(true);
      return;
    }
    if (choice === "self_finance") {
      setSelfFinanceConfirmOpen(true);
      return;
    }
    setFullPaymentConfirmOpen(true);
  }, [choice]);

  // Straight into Shivi's action turns — no “Payment option confirmed” interstitials.
  const onFullPaymentConfirm = useCallback(() => {
    setFullPaymentConfirmOpen(false);
    writeConciergeEcho("I'll pay in full");
    router.push("/payment/full-payment-confirmed");
  }, [router]);

  const onSelfFinanceConfirm = useCallback(() => {
    setSelfFinanceConfirmOpen(false);
    writeConciergeEcho("I'll arrange the loan myself");
    router.push("/payment/self-finance-action");
  }, [router]);

  const onBankSheetConfirm = useCallback((bankId: string) => {
    setBankSheetOpen(false);
    writeConciergeEcho(`Let's finance via ${bankForQueryParam(bankId).name}`);
    router.push(`/payment/acko-drive-finance-action?bank=${encodeURIComponent(bankId)}`);
  }, [router]);

  const ctaLabel =
    choice === "acko_drive"
      ? "Show me the bank options"
      : choice === "self_finance"
        ? "I'll use my own bank loan"
        : "I'll pay in full";

  return (
    <>
      <ConciergeTurnShell
        says={[
          "How do you want to pay the remaining ₹13,63,780?",
          "Pick what suits you — I'll make any of these painless.",
        ]}
        artifact={
          <>
            <div className="payment-success-stagger w-full">
              <OptionCard
                id="acko_drive"
                selected={choice === "acko_drive"}
                onSelect={() => setChoice("acko_drive")}
                illustrationSrc={PAYMENT_CHOOSE_ASSETS.ackoDriveFinance}
                title="Finance with ACKO Drive"
                chip="Easiest"
                blurb="You pick the bank, I run the entire loan — at rates I've already pushed down for you."
                stats={[
                  { value: "~2 days", caption: "to approval" },
                  { value: `${formatInr(ACKO_EMI_FROM_INR)}/mo`, caption: "EMI from" },
                ]}
                flow={[
                  "You pick the bank",
                  "Apply in minutes",
                  "Bank verifies & approves",
                  "Pay your down payment",
                  "Bank pays the dealer",
                ]}
                flowBankLogosOnStep={0}
              />
            </div>

            <div
              className="payment-success-stagger w-full"
              style={{ animationDelay: `${STAGGER_OPTION_STEP_MS}ms` }}
            >
              <OptionCard
                id="self_finance"
                selected={choice === "self_finance"}
                onSelect={() => setChoice("self_finance")}
                illustrationSrc={PAYMENT_CHOOSE_ASSETS.selfFinance}
                title="Loan from your own bank"
                chip="Most control"
                blurb="Your bank, your terms — bring me the sanction letter and I take it from there."
                stats={[
                  { value: "5–7 days", caption: "typical bank approval" },
                  { value: "Any bank", caption: "your relationship, your rate" },
                ]}
                flow={[
                  "I hand you the invoice",
                  "Your bank approves the loan",
                  "Pay your down payment",
                  "Your bank pays the dealer",
                ]}
              />
            </div>

            <div
              className="payment-success-stagger w-full"
              style={{ animationDelay: `${2 * STAGGER_OPTION_STEP_MS}ms` }}
            >
              <OptionCard
                id="full_payment"
                selected={choice === "full_payment"}
                onSelect={() => setChoice("full_payment")}
                illustrationSrc={PAYMENT_CHOOSE_ASSETS.fullCash}
                title="Pay in full — no loan"
                chip="Fastest"
                blurb="No loan, no EMI, no paperwork — pay and your car gets ready for delivery."
                stats={[
                  { value: formatInr(FULL_PAYMENT_CAR_AMOUNT_INR), caption: "due now" },
                  { value: "No bank wait", caption: "fastest to delivery" },
                ]}
                flow={[
                  "Pay — in parts or at once",
                  "That’s the money done",
                  "We get your car ready",
                ]}
              />
            </div>
          </>
        }
        replies={[{ label: ctaLabel, onClick: onContinue, echo: null }]}
        footnote="Your delivery date locks in once the money plan is set — best done now"
        callLabel="Not sure? I can call you"
        manageShowVehicleIdentification
      />

      <BankSelectionBottomSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onConfirm={onBankSheetConfirm}
      />

      <SelfFinanceConfirmBottomSheet
        open={selfFinanceConfirmOpen}
        onClose={() => setSelfFinanceConfirmOpen(false)}
        onConfirm={onSelfFinanceConfirm}
      />

      <FullPaymentConfirmBottomSheet
        open={fullPaymentConfirmOpen}
        onClose={() => setFullPaymentConfirmOpen(false)}
        onConfirm={onFullPaymentConfirm}
      />
    </>
  );
}
