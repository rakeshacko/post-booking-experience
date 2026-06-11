"use client";

import Image from "next/image";

import infoIcon from "@/assets/Info.svg";

const RTO_REGISTRATION_INFO_COPY =
  "You'll get your registration number the moment the RTO issues it.";

/**
 * RTO registration status — matches hero info callout on `KycBookingProcessingScreen` (info icon + xs body).
 */
export function RtoRegistrationStatusCard() {
  return (
    <section
      className="flex w-full items-center gap-3 rounded-2xl bg-white card-elevated px-3 py-3 text-left"
      aria-label="RTO registration status"
    >
      <span className="relative h-5 w-5 shrink-0" aria-hidden>
        <Image
          src={infoIcon}
          alt=""
          fill
          className="object-contain"
          unoptimized
          sizes="20px"
        />
      </span>
      <p className="min-w-0 flex-1 text-xs font-normal leading-[18px] text-[#121212]">
        {RTO_REGISTRATION_INFO_COPY}
      </p>
    </section>
  );
}
