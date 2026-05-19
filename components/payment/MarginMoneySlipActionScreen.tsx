"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { BankTransferUtrConfirmBottomSheet } from "@/components/payment/BankTransferUtrConfirmBottomSheet";
import { MarginMoneySlipCard } from "@/components/payment/MarginMoneySlipCard";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";

const HEADLINE = "Your margin money slip is ready!";

const SUBLINE =
  "Your down payment is received. Share this slip with your bank so they can transfer the loan amount to the dealer.";

/**
 * Self finance — after full down payment; user downloads margin money slip for the bank.
 */
export function MarginMoneySlipActionScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const loanAmount = searchParams.get("loan_amount");
  const originalDownPayment = searchParams.get("original_down_payment");

  const [bankTransferSheetOpen, setBankTransferSheetOpen] = useState(false);

  const { nextHref, prefetchHref } = useMemo(() => {
    const q = new URLSearchParams();
    if (bank) q.set("bank", bank);
    if (loanAmount) q.set("loan_amount", loanAmount);
    if (originalDownPayment) q.set("original_down_payment", originalDownPayment);
    const qs = q.toString();
    const base = qs ? `/payment/down-payment-insurance-setup?${qs}` : "/payment/down-payment-insurance-setup";
    return { nextHref: base, prefetchHref: base };
  }, [bank, loanAmount, originalDownPayment]);

  const onBankTransferConfirm = useCallback(
    (utr: string) => {
      setBankTransferSheetOpen(false);
      const q = new URLSearchParams();
      if (bank) q.set("bank", bank);
      if (loanAmount) q.set("loan_amount", loanAmount);
      if (originalDownPayment) q.set("original_down_payment", originalDownPayment);
      if (utr) q.set("bank_transfer_ref", utr);
      const qs = q.toString();
      const href = qs ? `/payment/down-payment-insurance-setup?${qs}` : "/payment/down-payment-insurance-setup";
      router.push(href);
    },
    [router, bank, loanAmount, originalDownPayment],
  );

  const heroSummaryCard = useMemo(() => <MarginMoneySlipCard />, []);

  const whatsNextCard = useMemo(
    () => <LoanProcessingWhatsNext variant="self_finance_margin_slip" />,
    [],
  );

  return (
    <>
      <KycBookingProcessingScreen
        headline={HEADLINE}
        subline={SUBLINE}
        heroIllustrationSrc={PAYMENT_CHOOSE_ASSETS.documentsReceived}
        heroSummaryCard={heroSummaryCard}
        nextHref={nextHref}
        prefetchHref={prefetchHref}
        nextCtaLabel="Confirm bank transfer"
        onPrimaryCtaClick={() => setBankTransferSheetOpen(true)}
        whatsNextCard={whatsNextCard}
      />
      <BankTransferUtrConfirmBottomSheet
        open={bankTransferSheetOpen}
        onClose={() => setBankTransferSheetOpen(false)}
        onConfirm={onBankTransferConfirm}
      />
    </>
  );
}
