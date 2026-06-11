"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoanApplicationFixedCta } from "@/components/payment/loan-application/LoanApplicationFixedCta";
import { LoanApplicationFormField } from "@/components/payment/loan-application/LoanApplicationFormField";
import {
  LOAN_APPLICATION_FIELD_STACK_GAP_CLASS,
  LOAN_APPLICATION_MAIN_CLASS,
  LOAN_APPLICATION_PAGE_TITLE_CLASS,
  LOAN_APPLICATION_SECTION_DIVIDER_CLASS,
  LOAN_APPLICATION_SECTION_GAP_CLASS,
  LOAN_APPLICATION_SECTION_LABEL_CLASS,
  LOAN_APPLICATION_STAGGER_MS,
  LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS,
  loanApplicationStaggerAfterCard,
} from "@/components/payment/loan-application/loan-application-layout";
import { LoanApplicationPageStagger } from "@/components/payment/loan-application/LoanApplicationPageStagger";
import { LoanApplicationShell } from "@/components/payment/loan-application/LoanApplicationShell";
import { useLoanApplicationBank } from "@/components/payment/loan-application/use-loan-application-bank";
import { useLoanApplicationState } from "@/components/payment/loan-application/use-loan-application-state";
import { emptyReference, type LoanApplicationReference } from "@/lib/loan-application-state";
import { loanApplicationSubmittedPath } from "@/lib/loan-application-urls";

function isReferenceComplete(ref: LoanApplicationReference) {
  return (
    ref.fullName.trim().length > 0 &&
    ref.phone.trim().length >= 10 &&
    ref.address.trim().length > 0
  );
}

type ReferenceFieldsProps = {
  prefix: string;
  value: LoanApplicationReference;
  onChange: (next: LoanApplicationReference) => void;
  /** Applied to the first field below a section label. */
  firstFieldClassName?: string;
};

function ReferenceFields({
  prefix,
  value,
  onChange,
  firstFieldClassName = "",
}: ReferenceFieldsProps) {
  const set =
    (key: keyof LoanApplicationReference) => (field: string) =>
      onChange({ ...value, [key]: field });

  const field = {
    variant: "placeholder" as const,
  };

  return (
    <>
      <LoanApplicationFormField
        {...field}
        id={`${prefix}-name`}
        label="Name"
        value={value.fullName}
        onChange={set("fullName")}
        autoComplete="name"
        className={firstFieldClassName}
      />

      <LoanApplicationFormField
        {...field}
        id={`${prefix}-phone`}
        label="Phone number"
        type="tel"
        value={value.phone}
        onChange={set("phone")}
        autoComplete="tel"
        className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
      />

      <LoanApplicationFormField
        {...field}
        id={`${prefix}-address`}
        label="Address"
        value={value.address}
        onChange={set("address")}
        autoComplete="street-address"
        multiline
        className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
      />
    </>
  );
}

export function LoanApplicationReferencesScreen() {
  const router = useRouter();
  const { bankId } = useLoanApplicationBank();
  const { state, hydrated, update } = useLoanApplicationState();
  const [ref1, setRef1] = useState(state.references[0]);
  const [ref2, setRef2] = useState(state.references[1]);

  useEffect(() => {
    if (!hydrated) return;
    setRef1(state.references[0]);
    setRef2(state.references[1]);
  }, [hydrated, state.references]);

  const canSubmit = isReferenceComplete(ref1) && isReferenceComplete(ref2);

  const onSubmitClick = useCallback(() => {
    if (!canSubmit) return;
    const normalized: [LoanApplicationReference, LoanApplicationReference] = [
      {
        fullName: ref1.fullName.trim(),
        phone: ref1.phone.trim(),
        address: ref1.address.trim(),
      },
      {
        fullName: ref2.fullName.trim(),
        phone: ref2.phone.trim(),
        address: ref2.address.trim(),
      },
    ];
    update({ references: normalized });
    router.push(loanApplicationSubmittedPath(bankId));
  }, [bankId, canSubmit, ref1, ref2, router, update]);

  return (
    <LoanApplicationShell currentRoute="references">
      <main className={LOAN_APPLICATION_MAIN_CLASS}>
        <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.title}>
          <h1 className={LOAN_APPLICATION_PAGE_TITLE_CLASS}>
            Two people who can vouch for you — the bank&apos;s standard ask
          </h1>
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger
          delayMs={LOAN_APPLICATION_STAGGER_MS.subtitle}
          className={LOAN_APPLICATION_SECTION_GAP_CLASS}
        >
          <p className={LOAN_APPLICATION_SECTION_LABEL_CLASS}>First reference</p>
          <ReferenceFields
            prefix="ref1"
            value={ref1 ?? emptyReference()}
            onChange={setRef1}
            firstFieldClassName={LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS}
          />
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger delayMs={loanApplicationStaggerAfterCard(1)}>
          <div className={LOAN_APPLICATION_SECTION_DIVIDER_CLASS} role="separator" />

          <p className={`${LOAN_APPLICATION_SECTION_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}>
            Second reference
          </p>
          <ReferenceFields
            prefix="ref2"
            value={ref2 ?? emptyReference()}
            onChange={setRef2}
            firstFieldClassName={LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS}
          />
        </LoanApplicationPageStagger>
      </main>

      <LoanApplicationFixedCta
        label="Submit loan application"
        onClick={onSubmitClick}
        disabled={!canSubmit}
        staggerDelayMs={loanApplicationStaggerAfterCard(2)}
      />
    </LoanApplicationShell>
  );
}
