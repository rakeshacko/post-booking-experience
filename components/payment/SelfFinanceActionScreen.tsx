"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";
import { ProformaInvoiceCard } from "@/components/payment/ProformaInvoiceCard";

const HEADLINE_LINE_1 = "Your proforma invoice";
const HEADLINE_LINE_2 = "is ready";

const SUBLINE =
  "Download and submit this to your bank to get your loan sanctioned — then come back to enter the disbursement amount they approve.";

const CTA_WARNING_LINE = "Confirm by 24 Apr, 3:00 PM to avoid cancellation";

/**
 * Self finance — “action” step after confirmation (`/payment/self-finance-confirmed`). Same shell as
 * {@link PaymentDefaultScreen}: processing hero + What’s next + primary CTA.
 */
export function SelfFinanceActionScreen() {
  const heroSummaryCard = useMemo(() => <ProformaInvoiceCard />, []);

  const whatsNextCard = useMemo(() => <LoanProcessingWhatsNext variant="self_finance_action" />, []);

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE_LINE_1}
      headlineLine2={HEADLINE_LINE_2}
      subline={SUBLINE}
      heroIllustrationSrc={PAYMENT_CHOOSE_ASSETS.documentsReceived}
      heroSummaryCard={heroSummaryCard}
      nextHref="/payment/pay-down-payment"
      prefetchHref="/payment/pay-down-payment"
      ctaWarningLine={CTA_WARNING_LINE}
      nextCtaLabel="Enter the disbursement amount"
      whatsNextCard={whatsNextCard}
    />
  );
}
