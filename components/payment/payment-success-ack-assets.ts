import { publicAssetPath } from "@/lib/public-asset-path";

/** Success ack screens in the payment journey (loan disbursement, etc.). */
export const PAYMENT_SUCCESS_ACK_ASSETS = {
  loanDisbursedIllustration: publicAssetPath("loan approved.svg"),
} as const;
