"use client";

import { useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { LoanApplicationMilestoneRail } from "@/components/payment/loan-application/LoanApplicationMilestoneRail";
import {
  LOAN_APPLICATION_HERO_GRADIENT_BOX_CLASS,
  LOAN_APPLICATION_HERO_GRADIENT_STYLE,
  LOAN_APPLICATION_HERO_MILESTONE_CLASS,
} from "@/components/payment/loan-application/loan-application-layout";
import { useLoanApplicationBank } from "@/components/payment/loan-application/use-loan-application-bank";
import type { LoanApplicationRoute } from "@/lib/loan-application-content";
import { loanApplicationPrevPath } from "@/lib/loan-application-urls";

type LoanApplicationShellProps = {
  currentRoute: LoanApplicationRoute;
  children: ReactNode;
};

export function LoanApplicationShell({ currentRoute, children }: LoanApplicationShellProps) {
  const router = useRouter();
  const { bankId } = useLoanApplicationBank();

  const handleBack = useCallback(() => {
    const prev = loanApplicationPrevPath(bankId, currentRoute);
    if (prev != null) router.push(prev);
    else router.back();
  }, [bankId, currentRoute, router]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#f1f0f5] font-sans">
      <div className="relative z-10 mx-auto flex w-full min-h-0 max-w-[640px] flex-1 flex-col">
        <div className="relative shrink-0">
          <div
            className={LOAN_APPLICATION_HERO_GRADIENT_BOX_CLASS}
            style={LOAN_APPLICATION_HERO_GRADIENT_STYLE}
            aria-hidden
          />
          <KycTopNavHeader
            transparent
            onBack={handleBack}
            endSlot={<GetHelpPillButton />}
          />
          <div className={LOAN_APPLICATION_HERO_MILESTONE_CLASS}>
            <LoanApplicationMilestoneRail currentRoute={currentRoute} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
