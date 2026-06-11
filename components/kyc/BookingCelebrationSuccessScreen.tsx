"use client";

import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Lottie from "lottie-react";

import { BookingCarCardDetails } from "@/components/kyc/BookingCarCardDetails";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import {
  CELEBRATION_LOTTIE_TO_HEADLINE_MT,
  HERO_ICON_TOP_PT,
  SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS,
} from "@/components/ui/success-screen-layout";
import { PaymentSuccessStagger } from "@/components/ui/stagger-container";

import bookingSuccessLottie from "./lottie/booking-success.json";

/** Default: booking-success Lottie (~one play-through if `complete` never fires). */
const DEFAULT_LOTTIE_FALLBACK_MS = 1600;
/** Header → car section (kept short; images preload on mount). */
const CAR_REVEAL_DELAY_MS = 180;

const CAR_MODEL = "Creta";

function usePreloadBookingImages(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const hrefs = [BOOKING_CONFIRMED_ASSETS.cardBackdrop, BOOKING_CONFIRMED_ASSETS.carCutout];
    const links = hrefs.map((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((el) => el.remove());
  }, [enabled]);
}

export type BookingCelebrationSuccessScreenProps = {
  /** Main headline below the Lottie (e.g. booking confirmed vs finance partner confirmed). */
  headline: string;
  /** Optional line(s) under the headline (e.g. banking partner + logo + Change). */
  belowHeadline?: ReactNode;
  /**
   * When set, replaces the default car summary card (e.g. ACKO Drive “What’s next” payment steps).
   */
  replaceCarCardWith?: ReactNode;
  /**
   * With no custom card yet, omit the default booked-car card (modify-selection snapshot loading).
   */
  holdCarCardUntilCustom?: boolean;
  /** Route for the primary CTA. */
  okayPath: string;
  /** Primary bottom button label (default **Continue**). */
  ctaLabel?: string;
  /** Override bundled success animation (default: booking-success). */
  lottieAnimation?: unknown;
  /**
   * Max wait before revealing headline if `onComplete` does not fire (ms).
   * Match ~one loop of the chosen animation (e.g. 90f @ 30fps ≈ 3200).
   */
  lottieFallbackMs?: number;
  /** Called once when the headline block is revealed (after Lottie). */
  onHeadlineReveal?: () => void;
  /**
   * When set, shows the “Up next” strip above the primary CTA (Figma 1708:6415).
   * e.g. `"Car allocation"`.
   */
  upNextText?: string;
  /** When both set, shows a divider under express delivery with engine and chassis numbers. */
  vehicleEngineNo?: string;
  vehicleChassisNo?: string;
};

/**
 * Shared success layout: Lottie tick → headline → car summary card → Continue CTA.
 * Used by KYC booking confirmed and ACKO Drive finance confirmation.
 */
export function BookingCelebrationSuccessScreen({
  headline,
  belowHeadline,
  replaceCarCardWith,
  holdCarCardUntilCustom = false,
  okayPath,
  ctaLabel = "Continue",
  lottieAnimation,
  lottieFallbackMs = DEFAULT_LOTTIE_FALLBACK_MS,
  onHeadlineReveal,
  upNextText,
  vehicleEngineNo,
  vehicleChassisNo,
}: BookingCelebrationSuccessScreenProps) {
  const showVehicleIdentification =
    vehicleEngineNo != null &&
    vehicleEngineNo.length > 0 &&
    vehicleChassisNo != null &&
    vehicleChassisNo.length > 0;
  const router = useRouter();
  const showDefaultCarCard = replaceCarCardWith == null && !holdCarCardUntilCustom;
  const showCustomCarCard = replaceCarCardWith != null;
  const showCarSection = showDefaultCarCard || showCustomCarCard;
  const contentScrollClass =
    showCustomCarCard ? "overflow-y-auto" : "overflow-hidden";
  usePreloadBookingImages(showDefaultCarCard);

  const [showHeader, setShowHeader] = useState(false);
  const [showCar, setShowCar] = useState(false);
  const headerRevealFallbackRef = useRef<number | null>(null);
  const animationData = lottieAnimation ?? bookingSuccessLottie;

  const handleAnimationFinished = useCallback(() => {
    if (headerRevealFallbackRef.current != null) {
      window.clearTimeout(headerRevealFallbackRef.current);
      headerRevealFallbackRef.current = null;
    }
    setShowHeader(true);
  }, []);

  useEffect(() => {
    headerRevealFallbackRef.current = window.setTimeout(() => {
      headerRevealFallbackRef.current = null;
      setShowHeader(true);
    }, lottieFallbackMs);
    return () => {
      if (headerRevealFallbackRef.current != null) {
        window.clearTimeout(headerRevealFallbackRef.current);
        headerRevealFallbackRef.current = null;
      }
    };
  }, [lottieFallbackMs]);

  useEffect(() => {
    if (!showHeader) return;
    onHeadlineReveal?.();
    const id = window.setTimeout(() => setShowCar(true), CAR_REVEAL_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [showHeader, onHeadlineReveal]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#f1f0f5] font-sans">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-[linear-gradient(to_bottom,rgba(232,248,239,0.9),rgba(244,251,247,0.4),rgba(244,251,247,0))] transition-opacity duration-700"
        aria-hidden
      />

      <div
        className={`relative flex min-h-0 flex-1 flex-col justify-start overflow-hidden ${HERO_ICON_TOP_PT} transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]`}
      >
        <div
          className={`mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col px-5 ${contentScrollClass}`}
        >
          <div className="flex w-full flex-col items-center text-center">
            <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
              <Lottie
                key={lottieAnimation != null ? "custom-lottie" : "booking-success"}
                animationData={animationData}
                loop={false}
                className="h-full w-full"
                aria-label="Success animation"
                onComplete={handleAnimationFinished}
              />
            </div>

            {showHeader && (
              <PaymentSuccessStagger
                className={`${CELEBRATION_LOTTIE_TO_HEADLINE_MT} flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
                delay={0.2}
              >
                <h1 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
                  {headline}
                </h1>
                {belowHeadline != null && (
                  <PaymentSuccessStagger className="w-full text-center" delay={0.4}>
                    {belowHeadline}
                  </PaymentSuccessStagger>
                )}
              </PaymentSuccessStagger>
            )}
          </div>

          {showCar &&
            showCarSection &&
            (showDefaultCarCard ? (
              <PaymentSuccessStagger
                className="relative mt-8 w-full self-center overflow-hidden rounded-2xl bg-white card-elevated"
                delay={0.6}
              >
                <div
                  className={`relative w-full overflow-hidden bg-white ${
                    showVehicleIdentification ? "min-h-[318px]" : "h-[244px]"
                  }`}
                >
                  <div aria-hidden className="absolute inset-0">
                    <div className="absolute inset-0 overflow-hidden">
                      <Image
                        src={BOOKING_CONFIRMED_ASSETS.cardBackdrop}
                        alt=""
                        fill
                        className="object-cover"
                        style={{ objectPosition: "center 28%" }}
                        sizes="(max-width: 640px) 100vw, 640px"
                        priority
                      />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, rgba(255,255,255,0) 74%, rgba(255,255,255,0.4) 100%), linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 28%)",
                      }}
                    />
                  </div>

                  <div className="absolute left-1/2 top-[30px] h-[102px] w-[180px] -translate-x-1/2 overflow-hidden">
                    <div className="relative mx-auto h-full w-full max-w-[180px]">
                      <Image
                        src={BOOKING_CONFIRMED_ASSETS.carCutout}
                        alt=""
                        fill
                        className="object-contain object-bottom"
                        sizes="180px"
                        priority
                      />
                    </div>
                  </div>

                  <div className="absolute inset-x-2 bottom-2 overflow-hidden rounded-xl border border-white/60 bg-white/90 shadow-sm backdrop-blur-[12px]">
                    <div className="px-3 py-3 text-left">
                      <BookingCarCardDetails
                        engineNo={showVehicleIdentification ? vehicleEngineNo : undefined}
                        chassisNo={showVehicleIdentification ? vehicleChassisNo : undefined}
                      />
                    </div>
                  </div>
                </div>
              </PaymentSuccessStagger>
            ) : (
              <PaymentSuccessStagger
                className="mt-8 w-full max-w-[640px] self-center"
                delay={0.6}
              >
                {replaceCarCardWith}
              </PaymentSuccessStagger>
            ))}
        </div>
      </div>

      {showCar && (
        <PaymentSuccessStagger
          className="z-10 shrink-0 bg-white pb-[env(safe-area-inset-bottom)]"
          delay={0.8}
        >
          <div className="mx-auto flex w-full max-w-[640px] flex-col">
            {upNextText != null && upNextText.length > 0 && (
              <div className="flex h-8 w-full shrink-0 items-center justify-center bg-[#f0f0f6] px-5">
                <p className="text-center text-xs leading-[18px] text-[#121212]">
                  <span className="font-medium">Up next:</span>
                  <span>{` ${upNextText}`}</span>
                </p>
              </div>
            )}
            <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="button"
                className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
                onClick={() => router.push(okayPath)}
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </PaymentSuccessStagger>
      )}
    </div>
  );
}

/** @internal — shared demo constants for headlines that mention the car model */
export const BOOKING_CELEBRATION_CAR_MODEL = CAR_MODEL;
