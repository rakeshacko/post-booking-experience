"use client";

import checkboxSelected from "@/assets/Checkbox selected.svg";
import checkboxUnselected from "@/assets/Checkbox unselected.svg";
import Image from "next/image";
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
import type { LoanApplicationAddressFields } from "@/lib/loan-application-state";
import { loanApplicationNextPath } from "@/lib/loan-application-urls";

function isAddressComplete(address: LoanApplicationAddressFields) {
  return (
    address.pincode.trim().length >= 6 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.line1.trim().length > 0
  );
}

type AddressFieldsBlockProps = {
  prefix: string;
  value: LoanApplicationAddressFields;
  onChange: (next: LoanApplicationAddressFields) => void;
  /** Applied to the first field (PIN code) below a section label. */
  firstFieldClassName?: string;
};

function AddressFieldsBlock({
  prefix,
  value,
  onChange,
  firstFieldClassName = "",
}: AddressFieldsBlockProps) {
  const set =
    (key: keyof LoanApplicationAddressFields) => (field: string) =>
      onChange({ ...value, [key]: field });

  const field = {
    variant: "placeholder" as const,
  };

  return (
    <>
      <LoanApplicationFormField
        {...field}
        id={`${prefix}-pincode`}
        label="PIN code"
        value={value.pincode}
        onChange={set("pincode")}
        autoComplete="postal-code"
        className={`${firstFieldClassName} max-w-[154px]`}
      />

      <div className={`${LOAN_APPLICATION_FIELD_STACK_GAP_CLASS} grid grid-cols-2 gap-3`}>
        <LoanApplicationFormField
          {...field}
          id={`${prefix}-city`}
          label="City"
          value={value.city}
          onChange={set("city")}
          autoComplete="address-level2"
        />
        <LoanApplicationFormField
          {...field}
          id={`${prefix}-state`}
          label="State"
          value={value.state}
          onChange={set("state")}
          autoComplete="address-level1"
        />
      </div>

      <LoanApplicationFormField
        {...field}
        id={`${prefix}-address`}
        label="Address"
        value={value.line1}
        onChange={set("line1")}
        autoComplete="street-address"
        multiline
        className={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
      />
    </>
  );
}

export function LoanApplicationAddressScreen() {
  const router = useRouter();
  const { bankId } = useLoanApplicationBank();
  const { state, hydrated, update } = useLoanApplicationState();
  const [permanent, setPermanent] = useState(state.address.permanent);
  const [current, setCurrent] = useState(state.address.current);
  const [sameAsPermanent, setSameAsPermanent] = useState(state.address.currentSameAsPermanent);

  useEffect(() => {
    if (!hydrated) return;
    setPermanent(state.address.permanent);
    setCurrent(state.address.current);
    setSameAsPermanent(state.address.currentSameAsPermanent);
  }, [hydrated, state.address]);

  useEffect(() => {
    if (sameAsPermanent) setCurrent(permanent);
  }, [sameAsPermanent, permanent]);

  const effectiveCurrent = sameAsPermanent ? permanent : current;
  const canContinue = isAddressComplete(permanent) && isAddressComplete(effectiveCurrent);

  const onContinue = useCallback(() => {
    if (!canContinue) return;
    update({
      address: {
        permanent,
        current: effectiveCurrent,
        currentSameAsPermanent: sameAsPermanent,
      },
    });
    router.push(loanApplicationNextPath(bankId, "address"));
  }, [bankId, canContinue, effectiveCurrent, permanent, router, sameAsPermanent, update]);

  return (
    <LoanApplicationShell currentRoute="address">
      <main className={LOAN_APPLICATION_MAIN_CLASS}>
        <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.title}>
          <h1 className={LOAN_APPLICATION_PAGE_TITLE_CLASS}>Where do you live? The bank wants it on file.</h1>
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger
          delayMs={LOAN_APPLICATION_STAGGER_MS.subtitle}
          className={LOAN_APPLICATION_SECTION_GAP_CLASS}
        >
          <p className={LOAN_APPLICATION_SECTION_LABEL_CLASS}>Permanent address</p>
          <AddressFieldsBlock
            prefix="perm"
            value={permanent}
            onChange={setPermanent}
            firstFieldClassName={LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS}
          />
        </LoanApplicationPageStagger>

        <LoanApplicationPageStagger delayMs={loanApplicationStaggerAfterCard(1)}>
          <div className={LOAN_APPLICATION_SECTION_DIVIDER_CLASS} role="separator" />

          <p className={`${LOAN_APPLICATION_SECTION_GAP_CLASS} ${LOAN_APPLICATION_SECTION_LABEL_CLASS}`}>
            Current address
          </p>

          <label
            className={`${LOAN_APPLICATION_TITLE_TO_CARD_GAP_CLASS} flex cursor-pointer items-center gap-2 rounded-lg bg-[#f5f5f5] p-3`}
          >
            <input
              type="checkbox"
              checked={sameAsPermanent}
              onChange={(e) => setSameAsPermanent(e.target.checked)}
              className="sr-only"
            />
            <Image
              src={sameAsPermanent ? checkboxSelected : checkboxUnselected}
              alt=""
              width={20}
              height={20}
              unoptimized
              aria-hidden
            />
            <span className="text-sm font-normal leading-5 text-[#121212]">
              Same as permanent address
            </span>
          </label>

          {!sameAsPermanent ? (
            <AddressFieldsBlock
              prefix="curr"
              value={current}
              onChange={setCurrent}
              firstFieldClassName={LOAN_APPLICATION_FIELD_STACK_GAP_CLASS}
            />
          ) : null}
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
