"use client";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { ShiviIntroNavArrow } from "@/components/kyc/ShiviIntroNavArrow";

/**
 * “Get help” + centered arrow above the Shivi intro backdrop ([Figma 2479:7600](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2479-7600)).
 */
export function ShiviIntroCoachmark() {
  return (
    <div className="pointer-events-none relative z-30 mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-end gap-2 pr-5">
        <div className="pointer-events-auto relative mr-10">
          <GetHelpPillButton highlighted />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-5">
        <ShiviIntroNavArrow />
      </div>
    </div>
  );
}
