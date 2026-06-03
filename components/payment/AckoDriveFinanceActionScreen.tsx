"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { AckoDriveBankPartnerRow } from "@/components/payment/AckoDriveBankPartnerRow";
import { AckoDriveFinanceSuccessLottie } from "@/components/payment/AckoDriveFinanceSuccessLottie";
import { AckoDriveLoanDocumentsHint } from "@/components/payment/AckoDriveLoanDocumentsHint";
import {
  ackoDriveFinanceActionPath,
  bankForQueryParam,
} from "@/components/payment/acko-drive-finance-bank";
import { loanApplicationEntryPath } from "@/lib/loan-application-urls";
import { BankSelectionBottomSheet } from "@/components/payment/BankSelectionBottomSheet";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const HEADLINE_LINE_1 = "You're financing with";
const HEADLINE_LINE_2 = "ACKO Drive";

/**
 * ACKO Drive finance — action step after celebration confirmation.
 * Same shell as {@link SelfFinanceActionScreen}: processing hero + What's next + primary CTA.
 */
export function AckoDriveFinanceActionScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);
  const [bankSheetOpen, setBankSheetOpen] = useState(false);

  const uploadHref = useMemo(() => loanApplicationEntryPath(bank.id, { fresh: true }), [bank.id]);

  const onBankChange = useCallback(() => setBankSheetOpen(true), []);

  const onBankSheetConfirm = useCallback(
    (nextBankId: string) => {
      setBankSheetOpen(false);
      router.replace(ackoDriveFinanceActionPath(nextBankId));
    },
    [router],
  );

  const belowHeadline = useMemo(
    () => <AckoDriveBankPartnerRow bank={bank} onChange={onBankChange} />,
    [bank, onBankChange],
  );

  const heroSummaryCard = useMemo(() => <AckoDriveLoanDocumentsHint />, []);

  const whatsNextCard = useMemo(
    () => <LoanProcessingWhatsNext variant="acko_drive_action" />,
    [],
  );

  return (
    <>
      <KycBookingProcessingScreen
        headline={HEADLINE_LINE_1}
        headlineLine2={HEADLINE_LINE_2}
        belowHeadline={belowHeadline}
        subline=""
        heroIllustrationSlot={<AckoDriveFinanceSuccessLottie />}
        heroSummaryCard={heroSummaryCard}
        nextHref={uploadHref}
        prefetchHref={uploadHref}
        nextCtaLabel="Continue with loan application"
        whatsNextCard={whatsNextCard}
        manageBookingShowVehicleIdentification
      />
      <BankSelectionBottomSheet
        open={bankSheetOpen}
        onClose={() => setBankSheetOpen(false)}
        onConfirm={onBankSheetConfirm}
        initialBankId={bank.id}
      />
    </>
  );
}
