"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { BankSelectionBottomSheet } from "@/components/payment/BankSelectionBottomSheet";
import { FullPaymentConfirmBottomSheet } from "@/components/payment/FullPaymentConfirmBottomSheet";
import { SelfFinanceConfirmBottomSheet } from "@/components/payment/SelfFinanceConfirmBottomSheet";
import {
  PARTNER_BANK_LOGOS,
  PAYMENT_CHOOSE_ASSETS,
} from "@/components/payment/payment-choose-assets";

/** Stagger: nav + CTA immediate; then headline → each finance card in order (`payment-success-stagger` in globals). */
const STAGGER_TITLE_MS = 90;
const STAGGER_FIRST_OPTION_MS = 280;
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

type OptionCardProps = {
  id: PaymentOptionId;
  selected: boolean;
  onSelect: () => void;
  illustrationSrc: string;
  title: string;
  children: ReactNode;
};

function OptionCard({ id, selected, onSelect, illustrationSrc, title, children }: OptionCardProps) {
  return (
    <button
      type="button"
      id={`payment-option-${id}`}
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-2xl border p-[15px] text-left transition-colors ${
        selected ? "border-[#121212] bg-[#F5F5F5]" : "border-[#e8e8e8] bg-white"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src={illustrationSrc}
              alt=""
              fill
              className="object-contain"
              unoptimized
              sizes="48px"
            />
          </div>
          <RadioIndicator selected={selected} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-medium leading-6 text-[#121212]">{title}</p>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </button>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-[18px] text-xs leading-[18px] text-[#4b4b4b]">
      {items.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

/** Horizontal rule: 4px dash, 2px gap. */
function PartnerBanksSeparator() {
  return (
    <div
      className="h-px w-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, #e8e8e8 0, #e8e8e8 4px, transparent 4px, transparent 6px)",
      }}
      aria-hidden
    />
  );
}

function PartnerBankMarks() {
  return (
    <div className="mt-3">
      <PartnerBanksSeparator />
      <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto">
        <p className="shrink-0 text-xs leading-[18px] text-[#4b4b4b]">Partner banks:</p>
        {PARTNER_BANK_LOGOS.map((bank) => (
          <span
            key={bank.alt}
            className="relative h-5 w-5 shrink-0"
            title={bank.alt}
          >
            <Image
              src={bank.src}
              alt={bank.alt}
              fill
              className="object-contain"
              unoptimized
              sizes="20px"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Choose payment option — Figma Post-booking-experience / Payment options (1890:7959).
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

  const onFullPaymentConfirm = useCallback(() => {
    setFullPaymentConfirmOpen(false);
    router.push("/payment/full-payment-confirmed");
  }, [router]);

  const onSelfFinanceConfirm = useCallback(() => {
    setSelfFinanceConfirmOpen(false);
    router.push("/payment/self-finance-confirmed");
  }, [router]);

  const onBankSheetConfirm = useCallback((bankId: string) => {
    setBankSheetOpen(false);
    router.push(`/payment/acko-drive-finance-confirmed?bank=${encodeURIComponent(bankId)}`);
  }, [router]);

  const ctaLabel =
    choice === "acko_drive"
      ? "See bank options"
      : choice === "self_finance"
        ? "I'll go with Self finance"
        : "I'll go with full payment";

  return (
    <div className="min-h-dvh bg-[#FFFFFF] font-sans">
      <KycTopNavHeader transparent endSlot={<GetHelpPillButton />} />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[8px]">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          <span className="block">You can choose from below</span>
          <span className="block">payment options</span>
        </h1>

        <div className="mt-[20px] flex flex-col gap-4">
          <div
            className="payment-success-stagger w-full"
            style={{ animationDelay: `${STAGGER_FIRST_OPTION_MS}ms` }}
          >
            <OptionCard
              id="acko_drive"
              selected={choice === "acko_drive"}
              onSelect={() => setChoice("acko_drive")}
              illustrationSrc={PAYMENT_CHOOSE_ASSETS.ackoDriveFinance}
              title="Finance with ACKO Drive"
            >
              <BulletList
                items={[
                  "We handle the entire process for you",
                  "Pre-negotiated interest rates",
                  "Faster approvals with minimal effort",
                ]}
              />
              <PartnerBankMarks />
            </OptionCard>
          </div>

          <div
            className="payment-success-stagger w-full"
            style={{
              animationDelay: `${STAGGER_FIRST_OPTION_MS + STAGGER_OPTION_STEP_MS}ms`,
            }}
          >
            <OptionCard
              id="self_finance"
              selected={choice === "self_finance"}
              onSelect={() => setChoice("self_finance")}
              illustrationSrc={PAYMENT_CHOOSE_ASSETS.selfFinance}
              title="Self finance"
            >
              <BulletList
                items={[
                  "Arrange a loan with your preferred bank",
                  "Complete the process independently",
                ]}
              />
            </OptionCard>
          </div>

          <div
            className="payment-success-stagger w-full"
            style={{
              animationDelay: `${STAGGER_FIRST_OPTION_MS + 2 * STAGGER_OPTION_STEP_MS}ms`,
            }}
          >
            <OptionCard
              id="full_payment"
              selected={choice === "full_payment"}
              onSelect={() => setChoice("full_payment")}
              illustrationSrc={PAYMENT_CHOOSE_ASSETS.fullCash}
              title="Full payment"
            >
              <p className="text-xs leading-[18px] text-[#4b4b4b]">
                Pay the entire amount upfront. No loan or EMI involved.
              </p>
            </OptionCard>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button type="button" onClick={onContinue} className="primary-cta w-full">
            {ctaLabel}
          </button>
        </div>
      </div>

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
    </div>
  );
}
