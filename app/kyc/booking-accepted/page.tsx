import bookingAcceptedHero from "@/assets/Booking accepted.svg";
import phoneIcon from "@/assets/Phone.svg";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Post-processing — dealer OTP confirmed; booking accepted on ACKO Drive (Figma TBD).
 */
export default function KycBookingAcceptedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <FadePageTransition>
        <KycBookingProcessingScreen
          headline="Your booking is accepted, Sharath!"
          subline="Advaith Hyundai has been assigned to fulfil your booking."
          infoBox={{
            body: (
              <>
                Advaith Hyundai will call you soon.{" "}
                <span className="font-medium">Share the OTP</span> you receive to confirm your booking on
                the Hyundai portal.
              </>
            ),
          }}
          infoBoxIconSrc={phoneIcon}
          heroIllustrationSrc={bookingAcceptedHero}
          nextHref="/kyc/booking-confirmed"
          prefetchHref="/kyc/booking-confirmed"
        />
      </FadePageTransition>
    </ModifyNoChargesGatedPage>
  );
}
