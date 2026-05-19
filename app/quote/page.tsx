import { QuoteScreen } from "@/components/quote/QuoteScreen";
import { HeroPageTransition } from "@/components/ui/page-transition";

export default function QuotePage() {
  return (
    <HeroPageTransition>
      <QuoteScreen />
    </HeroPageTransition>
  );
}
