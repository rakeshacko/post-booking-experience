import Image from "next/image";

import arrowCoachmark from "@/assets/Arrow.svg";

/**
 * Coachmark arrow — `assets/Arrow.svg` ([Figma 2479:7600](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2479-7600)).
 */
export function ShiviIntroNavArrow() {
  return (
    <Image
      src={arrowCoachmark}
      alt=""
      width={120}
      height={240}
      className="pointer-events-none mx-auto block h-auto max-h-full w-[90px] max-w-[min(120px,40vw)] object-contain sm:w-[110px]"
      unoptimized
      aria-hidden
      sizes="120px"
    />
  );
}
