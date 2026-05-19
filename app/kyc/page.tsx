import { KycPendingScreen } from "@/components/kyc/KycPendingScreen";

/**
 * KYC verification (pending) — [Figma 2179:8512](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2179-8512).
 * Omit `HeroPageTransition`: its upward slide duplicated motion and felt like the page loading bottom-to-top.
 */
export default function KycPage() {
  return <KycPendingScreen />;
}
