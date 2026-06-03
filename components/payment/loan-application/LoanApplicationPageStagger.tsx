"use client";

import type { ReactNode } from "react";

import { PaymentSuccessStagger } from "@/components/ui/stagger-container";

type LoanApplicationPageStaggerProps = {
  children: ReactNode;
  className?: string;
  /** Delay in milliseconds (nav / milestone / CTA chrome stay immediate). */
  delayMs: number;
};

export function LoanApplicationPageStagger({
  children,
  className = "",
  delayMs,
}: LoanApplicationPageStaggerProps) {
  return (
    <PaymentSuccessStagger className={className} delay={delayMs / 1000}>
      {children}
    </PaymentSuccessStagger>
  );
}
