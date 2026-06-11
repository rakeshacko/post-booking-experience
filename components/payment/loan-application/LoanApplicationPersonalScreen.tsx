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
import type { LoanApplicationOfficialAddress } from "@/lib/loan-application-state";
import { loanApplicationNextPath } from "@/lib/loan-application-urls";

const MOTHER_NAME_HINT = "Required by the bank for verification";

function isOfficialAddressComplete(address: LoanApplicationOfficialAddress) {
  return (
    address.pincode.trim().length >= 6 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.address.trim().length > 0
  );
}

export function LoanApplicationPersonalScreen() {
  const router = useRouter();
  const { bankId } = useLoanApplicationBank();
  const { state, hydrated, update } = useLoanApplicationState();
  const [email, setEmail] = useState(state.personal.email);
  const [motherName, setMotherName] = useState(state.personal.motherName);
  const [spouseName, setSpouseName] = useState(state.personal.spouseName);
  const [officialEmail, setOfficialEmail] = useState(state.personal.work.officialEmail);
  const [employerName, setEmployerName] = useState(state.personal.work.employerName);
  const [officialAddress, setOfficialAddress] = useState(state.personal.work.officialAddress);

  useEffect(() => {
    if (!hydrated) return;
    setEmail(state.personal.email);
    setMotherName(state.personal.motherName);
    setSpouseName(state.personal.spouseName);
    setOfficialEmail(state.personal.work.officialEmail);
    setEmployerName(state.personal.work.employerName);
    setOfficialAddress(state.personal.work.officialAddress);
  }, [hydrated, state.personal]);

  const setOfficialField =
    (key: keyof LoanApplicationOfficialAddress) => (value: string) =>
      setOfficialAddress((prev) => ({ ...prev, [key]: value }));

  const canContinue =
    email.trim().length > 0 &&
    motherName.trim().length > 0 &&
    officialEmail.trim().length > 0 &&
    employerName.trim().length > 0 &&
    isOfficialAddressComplete(officialAddress);

  const onContinue = useCallback(() => {
    if (!canContinue) return;
    update({
      personal: {
        email: email.trim(),
        motherName: motherName.trim(),
        spouseName: spouseName.trim(),
        work: {
          officialEmail: officialEmail.trim(),
          employerName: employerName.trim(),
          officialAddress: {
            pincode: officialAddress.pincode.trim(),
            city: officialAddress.city.trim(),
            state: officialAddress.state.trim(),
            address: officialAddress.address.trim(),
          },
        },
      },
    });
    router.push(loanApplicationNextPath(bankId, "personal"));
  }, [
    bankId,
    canContinue,
    email,
    employerName,
    motherName,
    officialAddress,
    officialEmail,
    router,
    spouseName,
    update,
  ]);

  const field = {
    variant: "placeholder" as const,
  };

  return (
    <LoanApplicationShell currentRoute="personal">
      <main className={LOAN_APPLICATION_MAIN_CLASS}>
        <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.title}>
          <h1 className={LOAN_APPLICATION_PAGE_TITLE_CLASS}>Now a bit about you — the bank insists.</h1>
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger
          delayMs={LOAN_APPLICATION_STAGGER_MS.subtitle}
          className={LOAN_APPLICATION_SECTION_GAP_CLASS}
        >
          <LoanApplicationFormField
            {...field}
            id="loan-app-personal-email"
            label="Personal email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />

          <LoanApplicationFormField
            {...field}
            id="loan-app-mother"
            label="Mother's name"
            value={motherName}
            onChange={setMotherName}
            autoComplete="off"
            hint={MOTHER_NAME_HINT}
            className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
          />

          <LoanApplicationFormField
            {...field}
            id="loan-app-spouse"
            label="Spouse (if married)"
            value={spouseName}
            onChange={setSpouseName}
            autoComplete="off"
            className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
          />
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.card}>
          <div className={LOAN_APPLICATION_SECTION_DIVIDER_CLASS} role="separator" />

          <p className={`${LOAN_APPLICATION_SECTION_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}>
            Work details
          </p>

          <LoanApplicationFormField
            {...field}
            id="loan-app-official-email"
            label="Official email"
            type="email"
            value={officialEmail}
            onChange={setOfficialEmail}
            autoComplete="email"
            className={LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS}
          />

          <LoanApplicationFormField
            {...field}
            id="loan-app-office"
            label="Office name"
            value={employerName}
            onChange={setEmployerName}
            autoComplete="organization"
            className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
          />

          <p
            className={`${LOAN_APPLICATION_FIELD_STACK_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}
          >
            Official address
          </p>

          <LoanApplicationFormField
            {...field}
            id="loan-app-official-pin"
            label="PIN code"
            value={officialAddress.pincode}
            onChange={setOfficialField("pincode")}
            autoComplete="postal-code"
            className={`${LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS} max-w-[154px]`}
          />

          <div
            className={`${LOAN_APPLICATION_FIELD_STACK_GAP_CLASS} grid grid-cols-2 gap-3`}
          >
            <LoanApplicationFormField
              {...field}
              id="loan-app-official-city"
              label="City"
              value={officialAddress.city}
              onChange={setOfficialField("city")}
              autoComplete="address-level2"
            />
            <LoanApplicationFormField
              {...field}
              id="loan-app-official-state"
              label="State"
              value={officialAddress.state}
              onChange={setOfficialField("state")}
              autoComplete="address-level1"
            />
          </div>

          <LoanApplicationFormField
            {...field}
            id="loan-app-official-address"
            label="Address"
            value={officialAddress.address}
            onChange={setOfficialField("address")}
            autoComplete="street-address"
            multiline
            className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
          />
        </LoanApplicationPageStagger>
      </main>

      <LoanApplicationFixedCta
        label="Continue"
        onClick={onContinue}
        disabled={!canContinue}
        staggerDelayMs={loanApplicationStaggerAfterCard(2)}
      />
    </LoanApplicationShell>
  );
}
