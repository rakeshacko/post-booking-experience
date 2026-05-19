import { publicAssetPath } from "@/lib/public-asset-path";

/**
 * KYC pending screen assets.
 * Files live under `public/assets/` (sync from repo `assets/`).
 */
const asset = publicAssetPath;

export const KYC_ASSETS = {
  /** KYC shield hero — Post-booking (Figma 2179:8514). */
  kycHero: asset("KYC.svg"),
  /** Booking processing hero — `/kyc/processing` illustration (filename spelling per design export). */
  bookingProcessingHero: asset("booking proceesing.svg"),
  /** Loan flow hero — processing, down payment, delivery prep (not sanctioned). */
  loanProcessingHero: asset("loan processing.svg"),
  /** RTO registration prep hero — `/payment/car-delivery-rto-prep`. */
  rtoRegistrationProcessHero: asset("RTO Registration process.svg"),
  /** Car delivery scheduling hero — `/payment/car-delivery-schedule`. */
  carDeliveryHero: asset("Car delivery.svg"),
  /** Car insurance setup hero — `/payment/car-delivery-insurance-prep`. */
  insuranceInProgressHero: asset("Insurance in progress.svg"),
  /** Loan sanctioned / approved moment. */
  loanApprovedHero: asset("loan approved.svg"),
  /** Payment prompt hero — `/payment/default` and similar. */
  paymentHero: asset("payment.svg"),
  /** Post–full down payment received (`/payment/down-payment-insurance-setup`). */
  downPaymentCompleteHero: asset("Downpayment complete.svg"),
  avatar: asset("Shivi image.png"),
  /** Shivi avatar — compact crop for nav “Get help” pill. */
  avatarSmall: asset("Shivi small.png"),
  getHelp: asset("get help.svg"),
  onlineDot: asset("online.svg"),
  warning: asset("Warning.svg"),
  askShivi: asset("Ask shivi.svg"),
  iconBooking: asset("Your booking details.svg"),
  iconPayment: asset("Payment summary.svg"),
  iconModify: asset("Modify booking.svg"),
  chevronRight: asset("Chevron_right.svg"),
  /** What’s next — vertical timeline step states */
  timelineDone: asset("Done.svg"),
  timelineInProgress: asset("in progress.svg"),
  timelineNext: asset("Next step.svg"),
} as const;
