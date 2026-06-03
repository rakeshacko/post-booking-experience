"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { QuoteFlowMenuSheet } from "@/components/quote/QuoteFlowMenuSheet";
import {
  DEFAULT_EXPERIENCE_FLOW,
  getExperienceFlowDefinition,
  readExperienceFlow,
  writeExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import { resetKycVerificationFailureCount } from "@/lib/kyc-verification-attempts";
import { QUOTE_ASSETS } from "./quote-assets";

function MenuIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform active:scale-[0.98] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
      aria-label="Switch experience flow"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="#121212"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function DottedRule() {
  return (
    <hr
      className="my-4 w-full border-0 border-t border-dotted"
      style={{ borderColor: "var(--quote-border-light)" }}
    />
  );
}

export function QuoteScreen() {
  const router = useRouter();
  const [otherOpen, setOtherOpen] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(true);
  const [flowMenuOpen, setFlowMenuOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ExperienceFlow>(DEFAULT_EXPERIENCE_FLOW);

  useEffect(() => {
    setActiveFlow(readExperienceFlow());
  }, []);

  const handleFlowChange = useCallback(
    (flow: ExperienceFlow) => {
      writeExperienceFlow(flow);
      resetKycVerificationFailureCount();
      setActiveFlow(flow);
      const entryPath = getExperienceFlowDefinition(flow).entryPath;
      router.replace(entryPath);
    },
    [router],
  );

  return (
    <div className="relative min-h-dvh bg-[var(--color-surface-elevated)] pb-[140px]">
      {/* Floating flow menu — sits above header / content */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 mx-auto max-w-[640px] px-5 pt-4">
        <div className="pointer-events-auto">
          <MenuIconButton onClick={() => setFlowMenuOpen(true)} />
        </div>
      </div>

      {/* Dark header */}
      <header
        className="relative mx-auto w-full max-w-[640px] overflow-hidden bg-[var(--quote-header)] pb-6 pt-4 text-white"
        style={{ minHeight: 240 }}
      >
        <div className="relative z-[1] h-10 px-5 pt-2" aria-hidden />
        <div className="relative z-[1] mt-4 flex gap-4 px-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold leading-6 tracking-[-0.1px] text-white">
              Kia Seltos 1.0 HTX
            </h1>
            <p className="mt-1 text-xs leading-[18px] text-[#a6a6a6]">
              Petrol • Manual
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 shrink-0 rounded-full border border-white/30"
                style={{ background: "#c41e3a" }}
                aria-hidden
              />
              <span className="text-xs leading-[18px] text-white">
                Intense Red - Metallic
              </span>
            </div>
          </div>
          <div className="relative h-[75px] w-[128px] shrink-0 overflow-hidden rounded-xl bg-[#1a1a1a]">
            <Image
              src={QUOTE_ASSETS.carHero}
              alt="Kia Seltos"
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
              priority
            />
          </div>
        </div>
      </header>

      <div className="relative z-[2] mx-auto w-full max-w-[640px] -mt-16 px-5">
        {/* Price hero card */}
        <section className="overflow-hidden rounded-xl border border-[var(--quote-border-light)] bg-white shadow-sm tabular-nums">
          <div className="px-3 pb-2 pt-5 text-center">
            <p className="text-sm leading-5 text-[var(--quote-text-body)]">
              Your ACKO Drive price for Bengaluru
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#121212]">
              ₹13,63,780
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--quote-green)]">
              Your total savings ₹76,043
            </p>
          </div>
          <div
            className="flex items-center justify-center gap-2 py-3"
            style={{ background: "var(--quote-purple-tint)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                stroke="var(--quote-purple-text)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="text-xs font-medium leading-[18px]"
              style={{ color: "var(--quote-purple-text)" }}
            >
              Express Delivery by 25 Nov 2025
            </span>
          </div>
        </section>

        {/* Insurance coverage */}
        <h2 className="mb-3 mt-8 text-base font-semibold leading-[22px] text-[#121212]">
          ACKO Insurance coverage included
        </h2>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-5 rounded-xl border border-[var(--quote-border-light)] bg-white px-3 py-4 text-left transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#121212]">3 year</p>
            <p className="text-xs text-[var(--quote-text-body)]">Third Party cover</p>
          </div>
          <div
            className="flex h-10 w-px shrink-0 items-stretch bg-[var(--quote-border-light)]"
            aria-hidden
          />
          <div className="relative min-w-0 flex-1 pr-6">
            <span className="absolute right-0 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-[#e8e8e8]">
              <span className="text-xs leading-none text-[#121212]">+</span>
            </span>
            <p className="text-sm font-medium text-[#121212]">1 year</p>
            <p className="text-xs text-[var(--quote-text-body)]">
              Zero depreciation cover
            </p>
          </div>
          <svg
            className="h-4 w-4 shrink-0 text-[#121212]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Price quote */}
        <h2 className="mb-3 mt-10 text-base font-semibold leading-[22px] text-[#121212]">
          Price quote
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--quote-border-light)] bg-white tabular-nums">
          <div className="flex items-start justify-between gap-2 px-3 py-4">
            <span className="text-sm text-[#121212]">Ex-Showroom Price</span>
            <span className="shrink-0 text-sm font-medium text-[#121212]">
              ₹9,54,900
            </span>
          </div>

          <div className="border-t border-[var(--quote-border-light)] px-3 py-3">
            <button
              type="button"
              onClick={() => setOtherOpen((o) => !o)}
              className="-mx-1 flex w-[calc(100%+8px)] cursor-pointer items-center justify-between gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
            >
              <span className="text-sm text-[#121212]">Other charges</span>
              <span className="flex items-center gap-1">
                <span className="text-sm font-medium text-[#121212]">₹3,72,177</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`shrink-0 transition-transform ${otherOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {otherOpen ? (
              <div
                className="mt-3 space-y-3 rounded-lg p-3"
                style={{ background: "var(--quote-nested-bg)" }}
              >
                <Row label="Registration amount" value="₹1,50,261" small />
                <Row label="Dealer insurance premium" value="₹56,672" small />
                <Row label="Tax collected at source" value="₹12,579" small />
              </div>
            ) : null}
          </div>

          <DottedRule />

          <div className="px-3 pt-2">
            <p className="text-xs font-medium text-[var(--quote-text-tertiary)]">
              Insurance
            </p>
            <div className="mt-2 flex gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-[#121212]">
                ACKO Comprehensive Insurance (1year OD + 3 years TP)
              </p>
              <span className="shrink-0 text-sm font-medium text-[#121212]">
                ₹36,488
              </span>
            </div>
          </div>

          <DottedRule />

          <div className="px-3 py-3">
            <p className="text-xs font-medium text-[var(--quote-text-tertiary)]">FASTag</p>
            <div className="mt-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-[#121212]">HDFC FASTag</p>
                <button
                  type="button"
                  className="mt-1 cursor-pointer text-xs font-medium text-[var(--quote-red)] underline-offset-2 transition-opacity hover:opacity-80 hover:underline active:opacity-100"
                >
                  Remove
                </button>
              </div>
              <span className="text-sm font-medium text-[#121212]">₹500</span>
            </div>
          </div>

          <DottedRule />

          <div className="px-3 py-3">
            <p className="text-xs font-medium text-[var(--quote-text-tertiary)]">
              Accessories
            </p>
            <div className="mt-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-[#121212]">Premium package</p>
                <button
                  type="button"
                  className="mt-1 cursor-pointer text-xs font-medium text-[var(--quote-red)] underline-offset-2 transition-opacity hover:opacity-80 hover:underline active:opacity-100"
                >
                  Remove
                </button>
              </div>
              <span className="text-sm font-medium text-[#121212]">₹9,750</span>
            </div>
          </div>

          <DottedRule />

          <div className="px-3 py-3">
            <button
              type="button"
              onClick={() => setDiscountOpen((d) => !d)}
              className="-mx-1 flex w-[calc(100%+8px)] cursor-pointer items-center justify-between rounded-lg px-1 py-1 transition-colors hover:bg-[#fafafa] active:bg-[#f5f5f5]"
            >
              <span className="text-sm text-[#121212]">Total discount</span>
              <span className="flex items-center gap-1">
                <span className="text-sm font-medium text-[var(--quote-green)]">
                  -₹76,043
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform ${discountOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {discountOpen ? (
              <div
                className="mt-3 space-y-3 rounded-lg p-3"
                style={{ background: "var(--quote-nested-bg)" }}
              >
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-[var(--quote-text-body)]">ACKO Drive discount</span>
                  <span className="font-medium text-[var(--quote-green)]">-₹53,835</span>
                </div>
                <p className="text-[11px] leading-[14px] text-[var(--quote-text-tertiary)]">
                  (
                  <span className="font-medium text-[var(--quote-green)]">₹5,000</span> New car
                  savings balance applied)
                </p>
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-[var(--quote-text-body)]">Loan discount</span>
                  <span className="font-medium text-[var(--quote-green)]">-₹10,000</span>
                </div>
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-[var(--quote-text-body)]">Exchange discount</span>
                  <span className="font-medium text-[var(--quote-green)]">-₹10,000</span>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="px-3 py-4"
            style={{
              background:
                "linear-gradient(94.92deg, #deffe5 0%, #d7fdff 99.43%)",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-medium leading-6 text-[var(--quote-acko-title)]">
                ACKO Drive price
              </p>
              <p className="text-base font-semibold leading-[22px] text-[var(--quote-acko-title)]">
                ₹13,63,780
              </p>
            </div>
            <p className="mt-3 text-xs leading-[18px] text-[var(--quote-text-body)]">
              <span className="font-medium text-[#121212]">Did you know?</span> Our prices are
              lower than dealership price as we don&apos;t charge any commissions
            </p>
          </div>
        </div>

        {/* Cancellation policy */}
        <h2 className="mb-3 mt-10 text-base font-semibold leading-[22px] text-[#121212]">
          Cancellation policy
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--quote-border-light)]">
          <div className="flex border-b border-[var(--quote-border-light)]">
            <div className="w-[128px] shrink-0 border-r border-[var(--quote-border-light)] bg-[var(--quote-nested-bg)] p-4 text-sm text-[#121212]">
              Before
              <br />
              car allocation
            </div>
            <div className="flex flex-1 items-center p-4 text-sm font-medium text-[#121212]">
              No cancellation fee
            </div>
          </div>
          <div className="flex">
            <div className="w-[128px] shrink-0 border-r border-[var(--quote-border-light)] bg-[var(--quote-nested-bg)] p-4 text-sm text-[#121212]">
              After
              <br />
              car allocation
            </div>
            <div className="flex flex-1 items-center p-4 text-sm font-medium text-[var(--quote-red)]">
              ₹3000 cancellation fee
            </div>
          </div>
        </div>

        <div
          className="mt-4 flex gap-3 rounded-xl border p-4"
          style={{
            background: "var(--quote-info-bg)",
            borderColor: "var(--quote-info-border)",
          }}
        >
          <Image
            src={QUOTE_ASSETS.infoIcon}
            alt=""
            width={24}
            height={24}
            className="shrink-0"
            unoptimized
          />
          <div className="min-w-0 text-xs leading-[18px]">
            <p className="font-medium text-[#121212]">What is car allocation?</p>
            <p className="mt-1 text-[var(--quote-text-body)]">
              Assigning a specific car to customer selection during the waiting period
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-[var(--quote-link)] underline-offset-2 transition-opacity hover:opacity-80 hover:underline active:opacity-100"
        >
          Learn more about cancellation policies
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Disclaimer */}
        <section
          className="mt-8 rounded-xl px-1 py-6"
          style={{ background: "var(--quote-disclaimer-bg)" }}
        >
          <h3 className="text-base font-semibold leading-[22px] text-[#121212]">
            Things you should know before proccessing
          </h3>
          <p className="mt-3 text-sm leading-5 text-[var(--quote-text-body)]">
            The above deal holds true in the case of the customer purchasing all the components
            together as per ACKO Drive&apos;s policies. In the event of a customer not taking
            all the components of the deal as mention...{" "}
            <button
              type="button"
              className="cursor-pointer font-medium text-[var(--quote-link)] underline-offset-2 transition-opacity hover:opacity-80 hover:underline active:opacity-100"
            >
              Read more
            </button>
          </p>
        </section>
      </div>

      {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 z-20 mx-auto w-full max-w-[640px] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] tabular-nums">
        <div
          className="flex items-center justify-center gap-2 py-2 text-xs font-medium leading-[18px]"
          style={{
            background: "var(--quote-timer-bg)",
            color: "var(--quote-timer-text)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 7v5l3 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Offer expires in 24hr 53min
        </div>
        <div className="px-5 py-4">
          <button
            type="button"
            onClick={() => router.push("/payment")}
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/40"
          >
            Lock this price at ₹10,000
          </button>
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

function Row({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className={small ? "text-[var(--quote-text-body)]" : "text-[#121212]"}>
        {label}
      </span>
      <span className="font-medium text-[#121212]">{value}</span>
    </div>
  );
}
