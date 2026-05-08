"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";

const LOTTIE_TICK_URL =
  "https://lottie.host/2487840b-b4dd-4475-a409-663cd2b9403b/C1cWv7yapl.json";

const BOOKING_PAYMENT_SUCCESS_HERO = "/assets/acko-drive-finance-hero-gradient.svg";

/** Auto-advance: pay-down-payment (partial) or insurance setup (complete). */
export const DOWN_PAYMENT_SUCCESS_AUTO_REDIRECT_MS = 3000;

export type DownPaymentInstalmentSuccessProps = {
  /** Detail under the main title. */
  subline: string;
  nextHref: string;
};

/**
 * Down payment instalment acknowledgment — no CTA; auto-navigates after 3 seconds.
 */
export function DownPaymentInstalmentSuccess({ subline, nextHref }: DownPaymentInstalmentSuccessProps) {
  const router = useRouter();
  const [lottieData, setLottieData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(LOTTIE_TICK_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLottieData(data);
      })
      .catch(() => {
        if (!cancelled) setLottieData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const redirect = window.setTimeout(() => {
      router.push(nextHref);
    }, DOWN_PAYMENT_SUCCESS_AUTO_REDIRECT_MS);
    return () => window.clearTimeout(redirect);
  }, [nextHref, router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-white font-sans">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-full max-w-[360px] -translate-x-1/2"
        aria-hidden
      >
        <Image
          src={BOOKING_PAYMENT_SUCCESS_HERO}
          alt=""
          fill
          className="object-cover object-top"
          priority
          sizes="360px"
          unoptimized
        />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-8 pt-8">
        <div className="-translate-y-8 flex w-full max-w-md flex-col items-center text-center">
          <div className="relative flex h-[144px] w-[144px] shrink-0 items-center justify-center">
            {lottieData ? (
              <Lottie
                animationData={lottieData}
                loop={false}
                className="h-full w-full"
                aria-label="Payment received animation"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-full bg-[#22c55e] text-4xl text-white shadow-[0_0_48px_rgba(34,197,94,0.45)]"
                aria-hidden
              >
                ✓
              </div>
            )}
          </div>
          <h1 className="mt-2 text-[24px] font-semibold leading-7 tracking-tight text-[#1a1a1a]">
            Payment received
          </h1>
          <p className="mt-4 max-w-sm text-sm font-normal leading-5 text-[#6b7280]">{subline}</p>
        </div>
      </div>
    </div>
  );
}
