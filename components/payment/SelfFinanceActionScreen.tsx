"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { DisbursementAmountCollectionBottomSheet } from "@/components/payment/DisbursementAmountCollectionBottomSheet";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";
import { ProformaInvoiceCard } from "@/components/payment/ProformaInvoiceCard";

const HEADLINE_LINE_1 = "Your proforma invoice";
const HEADLINE_LINE_2 = "is ready";

const SUBLINE =
  "Download and submit this to your bank to get your loan sanctioned. Once they approve, come back to enter the disbursement amount.";

const CTA_WARNING_LINE =
  "Confirm sanctioned loan amount details by 24 Apr, 3:00 PM to avoid cancellation.";

/**
 * Self finance — “action” step after confirmation (`/payment/self-finance-confirmed`). Same shell as
 * {@link PaymentDefaultScreen}: processing hero + What’s next + primary CTA.
 */
export function SelfFinanceActionScreen() {
  const router = useRouter();
  const [disbursementAmountSheetOpen, setDisbursementAmountSheetOpen] = useState(false);

  const heroSummaryCard = useMemo(() => <ProformaInvoiceCard />, []);

  const whatsNextCard = useMemo(() => <LoanProcessingWhatsNext variant="self_finance_action" />, []);

  return (
    <>
      <KycBookingProcessingScreen
        headline={HEADLINE_LINE_1}
        headlineLine2={HEADLINE_LINE_2}
        subline={SUBLINE}
        heroIllustrationSrc={PAYMENT_CHOOSE_ASSETS.documentsReceived}
        heroSummaryCard={heroSummaryCard}
        nextHref="/payment/enter-sanctioned-loan-amount"
        prefetchHref="/payment/enter-sanctioned-loan-amount"
        ctaWarningLine={CTA_WARNING_LINE}
        nextCtaLabel="Enter disbursement amount"
        onPrimaryCtaClick={() => setDisbursementAmountSheetOpen(true)}
        whatsNextCard={whatsNextCard}
      />
      <DisbursementAmountCollectionBottomSheet
        open={disbursementAmountSheetOpen}
        onClose={() => setDisbursementAmountSheetOpen(false)}
        onSubmitAmount={(disbursementAmountInr) => {
          setDisbursementAmountSheetOpen(false);
          const q = new URLSearchParams();
          q.set("disbursement_inr", String(disbursementAmountInr));
          router.push(`/payment/enter-sanctioned-loan-amount?${q.toString()}`);
        }}
      />
    </>
  );
}
