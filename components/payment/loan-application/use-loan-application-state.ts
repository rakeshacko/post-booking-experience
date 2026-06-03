"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createDefaultLoanApplicationState,
  readLoanApplicationState,
  writeLoanApplicationState,
  type LoanApplicationState,
} from "@/lib/loan-application-state";

export function useLoanApplicationState() {
  const [state, setState] = useState<LoanApplicationState>(createDefaultLoanApplicationState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readLoanApplicationState());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: LoanApplicationState) => {
    setState(next);
    writeLoanApplicationState(next);
  }, []);

  const update = useCallback(
    (patch: Partial<LoanApplicationState>) => {
      const current = readLoanApplicationState();
      const next: LoanApplicationState = {
        ...current,
        ...patch,
        loanDetails: {
          ...current.loanDetails,
          ...patch.loanDetails,
        },
        personal: {
          ...current.personal,
          ...patch.personal,
          work: {
            ...current.personal.work,
            ...patch.personal?.work,
            officialAddress: {
              ...current.personal.work.officialAddress,
              ...patch.personal?.work?.officialAddress,
            },
          },
        },
        address: {
          ...current.address,
          ...patch.address,
          permanent: { ...current.address.permanent, ...patch.address?.permanent },
          current: { ...current.address.current, ...patch.address?.current },
        },
        references: patch.references ?? current.references,
        documents: patch.documents ?? current.documents,
      };
      persist(next);
      return next;
    },
    [persist],
  );

  return { state, hydrated, persist, update };
}
