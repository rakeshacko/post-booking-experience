"use client";

import { BookingCelebrationSuccessScreen } from "@/components/kyc/BookingCelebrationSuccessScreen";
import {
  DEMO_VEHICLE_CHASSIS_NO,
  DEMO_VEHICLE_ENGINE_NO,
} from "@/components/kyc/demo-vehicle-identification";

const USER_NAME = "Sharath";

/**
 * Shown after car allocation pending — same celebration + car card as booking confirmed; Okay → payment.
 */
export function CarAllocationConfirmedScreen() {
  return (
    <BookingCelebrationSuccessScreen
      headline={`Your car has been allocated, ${USER_NAME}!`}
      upNextText="Payment"
      vehicleEngineNo={DEMO_VEHICLE_ENGINE_NO}
      vehicleChassisNo={DEMO_VEHICLE_CHASSIS_NO}
      okayPath="/payment/default"
    />
  );
}
