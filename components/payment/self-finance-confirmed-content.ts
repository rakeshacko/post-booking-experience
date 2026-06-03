import type { StaticImageData } from "next/image";

import invoiceIcon from "@/assets/Invoice.svg";
import loanIcon from "@/assets/loan.svg";
import moneyIcon from "@/assets/money.svg";
import newCarIcon from "@/assets/New car.svg";

export type SelfFinanceHowItWorksStep = {
  description: string;
  icon: StaticImageData;
};

/**
 * Self finance — "Here is how it works" steps (confirmed screen + confirm bottom sheet).
 */
export const SELF_FINANCE_HOW_IT_WORKS_STEPS: readonly SelfFinanceHowItWorksStep[] = [
  {
    description:
      "Share the proforma invoice with your bank to get your loan approved.",
    icon: invoiceIcon,
  },
  {
    description:
      "Tell us your loan amount and pay your down payment.",
    icon: loanIcon,
  },
  {
    description:
      "Once your bank transfers the money to the dealer, share the transfer reference number with us to confirm.",
    icon: moneyIcon,
  },
  {
    description:
      "That is it. We start getting your car ready for delivery.",
    icon: newCarIcon,
  },
];
