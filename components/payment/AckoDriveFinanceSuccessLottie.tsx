"use client";

import Lottie from "lottie-react";

import ackoDriveFinanceSuccessLottie from "@/components/kyc/lottie/acko-drive-finance-success.json";

type AckoDriveFinanceSuccessLottieProps = {
  className?: string;
};

/** ACKO Drive finance success animation — shared by confirmed and action screens. */
export function AckoDriveFinanceSuccessLottie({
  className = "h-24 w-24",
}: AckoDriveFinanceSuccessLottieProps) {
  return (
    <Lottie
      animationData={ackoDriveFinanceSuccessLottie}
      loop={false}
      className={className}
      aria-label="Success animation"
    />
  );
}
