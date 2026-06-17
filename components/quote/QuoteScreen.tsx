"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { QuoteFlowMenuSheet } from "@/components/quote/QuoteFlowMenuSheet";
import {
  DEFAULT_EXPERIENCE_FLOW,
  getExperienceFlowDefinition,
  readExperienceFlow,
  writeExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import { resetChangePolicy } from "@/lib/change-policy";
import { resetKycVerificationFailureCount } from "@/lib/kyc-verification-attempts";
import { cn } from "@/lib/utils";
import { QUOTE_ASSETS } from "./quote-assets";

/* The car the whole journey is about — kept consistent with the concierge spine. */
const CAR_TITLE = "Hyundai Creta";
const CAR_VARIANT = "1.5 X-Line AT · Diesel";
const CAR_COLOUR = "Starry Night";
const CAR_COLOUR_SWATCH = "#1b2640";

const ON_ROAD_PRICE = "₹13,63,780";
const SAVINGS = "₹76,043";
const LOCK_AMOUNT = "₹10,000";
const DELIVERY_LINE = "Express delivery by 10 Jun";

const BREAKUP: readonly { label: string; value: string }[] = [
  { label: "Ex-showroom price", value: "₹9,54,900" },
  { label: "RTO, registration & taxes", value: "₹3,72,177" },
  { label: "Insurance (1yr OD + 3yr TP)", value: "₹36,488" },
  { label: "FASTag", value: "₹500" },
  { label: "Accessories", value: "₹9,750" },
];

export function QuoteScreen() {
  const router = useRouter();
  const [flowMenuOpen, setFlowMenuOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ExperienceFlow>(DEFAULT_EXPERIENCE_FLOW);
  const [breakupOpen, setBreakupOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    setActiveFlow(readExperienceFlow());
  }, []);

  const handleFlowChange = useCallback(
    (flow: ExperienceFlow) => {
      writeExperienceFlow(flow);
      resetKycVerificationFailureCount();
      resetChangePolicy();
      setActiveFlow(flow);
      router.replace(getExperienceFlowDefinition(flow).entryPath);
    },
    [router],
  );

  return (
    <div className="relative min-h-dvh bg-white pb-[152px]">
      {/* Soft hero backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px]"
        style={{ background: "linear-gradient(180deg, #ece6fb 0%, #f5f2fd 42%, #ffffff 100%)" }}
        aria-hidden
      />

      {/* Floating flow-switcher menu (demo affordance) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto max-w-[640px] px-5 pt-4">
        <div className="pointer-events-auto">
          <MenuIconButton onClick={() => setFlowMenuOpen(true)} />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[640px] px-5">
        {/* HERO — your exact car */}
        <section className="pt-[68px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--quote-purple-text)]">
            Your on-road quote · Bengaluru
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-[#121212]">
            {CAR_TITLE}
          </h1>
          <p className="mt-1 text-sm text-[var(--quote-text-body)]">{CAR_VARIANT}</p>
          <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-[var(--quote-border-light)] bg-white/80 px-3 py-1 backdrop-blur-sm">
            <span
              className="h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ background: CAR_COLOUR_SWATCH }}
              aria-hidden
            />
            <span className="text-xs font-medium text-[#121212]">{CAR_COLOUR}</span>
          </div>
          <div className="relative mx-auto mt-2 h-[176px] w-full max-w-[360px]">
            <Image
              src={QUOTE_ASSETS.carHero}
              alt={CAR_TITLE}
              fill
              className="object-contain"
              sizes="360px"
              priority
              unoptimized
            />
          </div>
        </section>

        {/* PRICE — the one number that matters, framed as a win */}
        <section className="rounded-2xl bg-white px-5 py-5 text-center card-elevated tabular-nums">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--quote-text-tertiary)]">
            On-road price · all-inclusive
          </p>
          <p className="mt-1.5 text-[34px] font-semibold leading-none tracking-tight text-[#121212]">
            {ON_ROAD_PRICE}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#e7f8ef] px-3 py-1">
            <CheckIcon className="text-[var(--quote-green)]" />
            <span className="text-xs font-semibold text-[var(--quote-green)]">
              You save {SAVINGS} vs dealerships
            </span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 border-t border-[var(--quote-border-light)] pt-4">
            <BoltIcon />
            <span className="text-sm font-medium text-[var(--quote-purple-text)]">{DELIVERY_LINE}</span>
          </div>
        </section>

        {/* Full breakup — there if you want it, out of the way if you don't */}
        <Expander
          className="mt-4"
          open={breakupOpen}
          onToggle={() => setBreakupOpen((o) => !o)}
          title="See full price breakup"
        >
          <div className="tabular-nums">
            <div className="space-y-3">
              {BREAKUP.map((r) => (
                <div key={r.label} className="flex justify-between gap-2 text-sm">
                  <span className="text-[var(--quote-text-body)]">{r.label}</span>
                  <span className="font-medium text-[#121212]">{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between gap-2 text-sm">
                <span className="text-[var(--quote-text-body)]">ACKO Drive savings</span>
                <span className="font-medium text-[var(--quote-green)]">−{SAVINGS}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between gap-2 border-t border-[var(--quote-border-light)] pt-3 text-sm">
              <span className="font-semibold text-[#121212]">On-road price</span>
              <span className="font-semibold text-[#121212]">{ON_ROAD_PRICE}</span>
            </div>
            <p className="mt-3 rounded-lg bg-[var(--quote-info-bg)] px-3 py-2 text-xs leading-[18px] text-[var(--quote-text-body)]">
              <span className="font-medium text-[#121212]">Lower than the dealership</span> — we
              don&apos;t charge any commission.
            </p>
          </div>
        </Expander>

        {/* REASSURANCE — the single line that lowers the stakes of tapping Lock */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--quote-info-border)] bg-[var(--quote-info-bg)] px-4 py-3.5">
          <ShieldCheckIcon />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#121212]">Lock it now, change your mind later</p>
            <p className="mt-0.5 text-xs leading-[18px] text-[var(--quote-text-body)]">
              Your {LOCK_AMOUNT} is fully refundable until your car is secured for you — and
              we&apos;ll tell you clearly before that point.
            </p>
          </div>
        </div>

        <Expander
          className="mt-3"
          open={policyOpen}
          onToggle={() => setPolicyOpen((o) => !o)}
          title="How cancellation works"
        >
          <p className="mb-3 text-xs leading-[18px] text-[var(--quote-text-body)]">
            <span className="font-medium text-[#121212]">“Secured” is the moment</span> your
            identity check clears and we reserve your exact car for you. You&apos;ll always be told
            before it happens — and even after, you can switch colour or model once for ₹5,000
            instead of cancelling.
          </p>
          <div className="overflow-hidden rounded-xl border border-[var(--quote-border-light)]">
            <PolicyRow
              stage="Before your car is secured"
              value="Free — every rupee comes back"
              tone="green"
            />
            <PolicyRow
              stage="After your car is secured"
              value="50% of what you've paid is retained"
              tone="red"
            />
            <PolicyRow
              stage="If we can't deliver"
              value="100% refund — our failure is never your cost"
              tone="green"
              last
            />
          </div>
        </Expander>
      </div>

      {/* STICKY FOOTER — calm hold, one action, refundability restated */}
      <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto w-full max-w-[640px] border-t border-[var(--quote-border-light)] bg-white tabular-nums">
        <div className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium text-[var(--quote-text-tertiary)]">
          <ClockIcon />
          We&apos;re holding this price for you · next 24 hours
        </div>
        <div className="px-5 pb-4 pt-1">
          <button
            type="button"
            onClick={() => router.push("/payment")}
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/40"
          >
            Lock this price · {LOCK_AMOUNT}
          </button>
          <p className="mt-2 text-center text-xs text-[var(--quote-text-tertiary)]">
            Fully refundable until your car is secured
          </p>
        </div>
      </div>

      <QuoteFlowMenuSheet
        open={flowMenuOpen}
        activeFlow={activeFlow}
        onClose={() => setFlowMenuOpen(false)}
        onFlowChange={handleFlowChange}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MenuIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
      aria-label="Switch experience flow"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 7h16M4 12h16M4 17h16" stroke="#121212" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function Expander({
  open,
  onToggle,
  title,
  children,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--quote-border-light)] bg-white",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
      >
        <span className="text-sm font-medium text-[#121212]">{title}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div className="border-t border-[var(--quote-border-light)] px-4 py-4">{children}</div>
      ) : null}
    </div>
  );
}

function PolicyRow({
  stage,
  value,
  tone,
  last,
}: {
  stage: string;
  value: string;
  tone: "green" | "red";
  last?: boolean;
}) {
  return (
    <div className={cn("flex", !last && "border-b border-[var(--quote-border-light)]")}>
      <div className="w-[124px] shrink-0 border-r border-[var(--quote-border-light)] bg-[var(--quote-nested-bg)] p-3.5 text-xs leading-[17px] text-[#121212]">
        {stage}
      </div>
      <div
        className={cn(
          "flex flex-1 items-center p-3.5 text-xs font-medium leading-[17px]",
          tone === "green" ? "text-[var(--quote-green)]" : "text-[var(--quote-red)]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ---- icons ---- */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
        stroke="var(--quote-purple-text)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.4-3 8.2-7 9-4-0.8-7-4.6-7-9V6l7-3z"
        stroke="var(--quote-purple-text)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="var(--quote-purple-text)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
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
  );
}
