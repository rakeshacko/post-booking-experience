"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";
import { ProformaInvoiceCard } from "@/components/payment/ProformaInvoiceCard";

const HEADLINE_LINE_1 = "Your proforma invoice";
const HEADLINE_LINE_2 = "is ready";

const SUBLINE =
  "Download this and submit it to your bank to get your loan sanctioned. Come back once your bank confirms the loan amount.";

const CTA_WARNING_LINE =
  "Confirm sanctioned loan amount details by 24 Apr, 3:00 PM to avoid cancellation.";

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
      nextHref="/payment/enter-disbursement-amount"
      prefetchHref="/payment/enter-disbursement-amount"
      ctaWarningLine={CTA_WARNING_LINE}
      nextCtaLabel="I have my loan amount"
      whatsNextCard={whatsNextCard}
    />
  );
}
