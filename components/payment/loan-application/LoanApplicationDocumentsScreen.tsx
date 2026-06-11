"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoanApplicationDocumentUploadSections } from "@/components/payment/loan-application/LoanApplicationDocumentUploadSections";
import { LoanApplicationFixedCta } from "@/components/payment/loan-application/LoanApplicationFixedCta";
import {
  LOAN_APPLICATION_MAIN_CLASS,
  LOAN_APPLICATION_PAGE_TITLE_CLASS,
  LOAN_APPLICATION_STAGGER_MS,
} from "@/components/payment/loan-application/loan-application-layout";
import { LoanApplicationPageStagger } from "@/components/payment/loan-application/LoanApplicationPageStagger";
import { LoanApplicationShell } from "@/components/payment/loan-application/LoanApplicationShell";
import { useLoanApplicationBank } from "@/components/payment/loan-application/use-loan-application-bank";
import { useLoanApplicationState } from "@/components/payment/loan-application/use-loan-application-state";
import { areLoanApplicationDocumentsComplete } from "@/lib/loan-application-documents-state";
import { loanApplicationNextPath } from "@/lib/loan-application-urls";

export function LoanApplicationDocumentsScreen() {
  const router = useRouter();
  const { bankId } = useLoanApplicationBank();
  const { state, hydrated, update } = useLoanApplicationState();
  const [uploads, setUploads] = useState(state.documents);

  useEffect(() => {
    if (!hydrated) return;
    setUploads(state.documents);
  }, [hydrated, state.documents]);

  const canContinue = areLoanApplicationDocumentsComplete(uploads);

  const onContinue = useCallback(() => {
    if (!canContinue) return;
    update({ documents: uploads });
    router.push(loanApplicationNextPath(bankId, "documents"));
  }, [bankId, canContinue, router, update, uploads]);

  return (
    <LoanApplicationShell currentRoute="documents">
      <main className={LOAN_APPLICATION_MAIN_CLASS}>
        <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.title}>
          <h1 className={LOAN_APPLICATION_PAGE_TITLE_CLASS}>
            Last bits of paper — what the bank needs from you
          </h1>
        </LoanApplicationPageStagger>

        <LoanApplicationDocumentUploadSections uploads={uploads} onUploadsChange={setUploads} />
      </main>

      <LoanApplicationFixedCta
        label="Continue"
        onClick={onContinue}
        disabled={!canContinue}
        staggerDelayMs={LOAN_APPLICATION_STAGGER_MS.cta}
      />
    </LoanApplicationShell>
  );
}
