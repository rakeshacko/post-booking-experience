"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { MoneyPlanCard, type MoneyPlanStep } from "@/components/payment/MoneyPlanCard";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";
import { FULL_PAYMENT_INSURANCE_INR } from "@/components/payment/loan-amount-demo-constants";
import { isAckoOnly, readDealerVisibility } from "@/lib/dealer-visibility";
import { buildLoanDisbursementReceivedHref, buildPayInsurancePremiumHref } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

const LOAN_HEADLINE = "Down payment received";
const LOAN_BANK_TRANSFER_HEADLINE = "Payment received";
const loanSubline = (recipient: string) =>
  `The bank is moving your loan to ${recipient}. Banks take 24–48 hours here — I'll confirm the moment it lands.`;
const LOAN_BANK_TRANSFER_SUBLINE =
  "I'm confirming the transfer from your bank — it takes 24–48 hours to clear. The moment it does, I start your delivery prep.";

const FULL_PAYMENT_HEADLINE = "Your payment is complete";
const FULL_PAYMENT_SUBLINE = "Your car is now being prepared for delivery.";

/** The insurance step — the one payment ahead, with the reason it waits. */
const INSURANCE_STEP: MoneyPlanStep = {
  state: "later",
  title: "Insurance — your last payment",
  amountLabel: formatInr(FULL_PAYMENT_INSURANCE_INR),
  detail:
    "Due just before delivery — the RTO won't register your car without a live policy. I'll ask you at exactly the right moment.",
};

/** Post–full down payment: hero + CTA + the money plan (paid / moving / one left). */
export function DownPaymentInsuranceSetupScreen() {
  const searchParams = useSearchParams();
  const { isFullPayment } = useFullPaymentJourney();
  const loanAmount = searchParams.get("loan_amount");
  const bank = searchParams.get("bank");
  const bankTransferRef = searchParams.get("bank_transfer_ref");
  const originalDownPayment = searchParams.get("original_down_payment");
  const isSelfFinance = bank === "self_finance" || bankTransferRef != null;

  // AckoDrive-only flow never names the dealer.
  const [ackoOnly, setAckoOnly] = useState(false);
  useEffect(() => {
    setAckoOnly(isAckoOnly(readDealerVisibility()));
  }, []);

  const headline = isFullPayment
    ? FULL_PAYMENT_HEADLINE
    : bankTransferRef
      ? LOAN_BANK_TRANSFER_HEADLINE
      : LOAN_HEADLINE;
  const subline = isFullPayment
    ? FULL_PAYMENT_SUBLINE
    : bankTransferRef
      ? LOAN_BANK_TRANSFER_SUBLINE
      : loanSubline(ackoOnly ? "AckoDrive" : "the dealer");

  const moneyPlanCard = useMemo(() => {
    const paidAmount =
      originalDownPayment != null && Number.isFinite(Number(originalDownPayment))
        ? Math.round(Number(originalDownPayment))
        : null;
    const paidLabel = paidAmount != null && paidAmount > 0 ? formatInr(paidAmount) : undefined;

    if (isFullPayment) {
      return (
        <MoneyPlanCard
          heading="One payment left"
          subheading="The car is fully paid — only insurance remains."
          steps={[
            {
              state: "done",
              title: "Car amount",
              amountLabel: paidLabel,
              detail: "Paid in full — the dealer starts delivery prep.",
            },
            INSURANCE_STEP,
          ]}
        />
      );
    }

    if (bankTransferRef) {
      return (
        <MoneyPlanCard
          heading="One payment left"
          subheading="Your money's in motion — only insurance remains."
          steps={[
            {
              state: "moving",
              title: "Your bank transfer clears",
              detail: `24–48 hours · I'm tracking it with your bank — ref ${bankTransferRef}.`,
            },
            INSURANCE_STEP,
          ]}
        />
      );
    }

    const bankName =
      bank && bank !== "self_finance" ? bankForQueryParam(bank).name : "Your bank";

    return (
      <MoneyPlanCard
        heading="One payment left"
        subheading="Your part's done for now — only insurance remains."
        steps={[
          {
            state: "done",
            title: "Down payment",
            amountLabel: paidLabel,
            detail: "Received just now.",
          },
          {
            state: "moving",
            title: `${bankName} sends the loan to the dealer`,
            detail: "24–48 hours · nothing needed from you — I'm chasing it.",
          },
          INSURANCE_STEP,
        ]}
      />
    );
  }, [isFullPayment, bankTransferRef, bank, originalDownPayment]);

  const nextHref = isFullPayment
    ? buildPayInsurancePremiumHref()
    : isSelfFinance
      ? buildPayInsurancePremiumHref({
          bank: bank ?? "self_finance",
          loanAmount,
        })
      : buildLoanDisbursementReceivedHref(loanAmount);

  return (
    <KycBookingProcessingScreen
      headline={headline}
      subline={subline}
      callLabel="Want an update? I can call you"
      heroIllustrationSrc={KYC_ASSETS.downPaymentCompleteHero}
      heroSummaryCard={moneyPlanCard}
      nextHref={nextHref}
      prefetchHref={nextHref}
      nextCtaLabel="Next"
      manageBookingShowVehicleIdentification
    />
  );
}
