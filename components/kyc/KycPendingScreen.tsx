"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import lockIcon from "@/assets/lock.svg";
import menuIcon from "@/assets/menu.svg";
import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ManageBookingBottomSheet } from "@/components/kyc/ManageBookingBottomSheet";
import { ShiviIntroBottomSheet } from "@/components/kyc/ShiviIntroBottomSheet";
import { WordByWordLine } from "@/components/payment/WordByWordLine";
import { AuroraLightLayer } from "@/components/ui/aurora-light-layer";
import {
  HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS,
  HERO_ICON_TOP_PT,
  HERO_ILLUSTRATION_TO_COPY_MT,
} from "@/components/ui/success-screen-layout";
import { cn } from "@/lib/utils";

const KYC_HEADLINE = "Verify your identity, Sharath";

const KYC_SUBLINE =
  "Your booking is waiting to be processed. Keep your PAN and Aadhaar ready. Once verified, we start processing right away.";

const KYC_INFO_BOX =
  "Your documents are encrypted and used only for verification. Safe and secure.";

const DEADLINE_LINE = "Complete by 24 Apr, 3:00 PM to avoid cancellation";

/** Word cadence for the hero headline. */
const HEADLINE_WORD_DELAY_MS = 135;
/** Shared opacity transition duration (headline words + subline + CTA + warning). */
const HERO_FADE_DURATION_CLASS = "duration-[450ms]";
/** Matches {@link HERO_FADE_DURATION_CLASS} — wait for opacity transition to finish. */
const CONTENT_FADE_MS = 450;
/** Delay after subline appears before the CTA fades in. */
const SUBLINE_TO_CTA_DELAY_MS = 240;
/** Delay after CTA is shown before the warning line appears. */
const CTA_TO_WARNING_DELAY_MS = 480;
/** Brief pause after all blocks are visible before the Shivi intro sheet. */
const SHIVI_INTRO_DELAY_MS = 200;

/** Hero block (header + aurora + content) fills at least 90% of the viewport; uses `dvh` for mobile browser chrome. */
const HERO_MIN_HEIGHT = "min-h-[90dvh]";

function MenuOptionsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="More options"
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#121212] transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
    >
      <span className="relative h-6 w-6" aria-hidden>
        <Image src={menuIcon} alt="" fill className="object-contain" unoptimized sizes="24px" />
      </span>
    </button>
  );
}

/**
 * KYC verification (pending) — [Figma 2179:8512](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2179-8512).
 * Shivi intro sheet after full page reveal — [Figma 2479:7600](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2479-7600).
 */
export function KycPendingScreen() {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [kycContentRevealed, setKycContentRevealed] = useState(false);
  const [shiviIntroOpen, setShiviIntroOpen] = useState(false);
  const [showSubline, setShowSubline] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [manageBookingOpen, setManageBookingOpen] = useState(false);

  const scheduleShiviIntro = useCallback(() => {
    window.setTimeout(() => {
      setKycContentRevealed(true);
    }, CONTENT_FADE_MS + SHIVI_INTRO_DELAY_MS);
  }, []);

  const onHeadlineComplete = useCallback(() => {
    setShowSubline(true);
    window.setTimeout(() => {
      setShowCta(true);
      window.setTimeout(() => {
        setShowWarning(true);
        scheduleShiviIntro();
      }, CTA_TO_WARNING_DELAY_MS);
    }, SUBLINE_TO_CTA_DELAY_MS);
  }, [scheduleShiviIntro]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!reduceMotion || !heroImageLoaded) return;
    setShowSubline(true);
    setShowCta(true);
    setShowWarning(true);
    const id = window.setTimeout(() => {
      setKycContentRevealed(true);
    }, CONTENT_FADE_MS + SHIVI_INTRO_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [reduceMotion, heroImageLoaded]);

  useEffect(() => {
    if (!kycContentRevealed) return;
    setShiviIntroOpen(true);
  }, [kycContentRevealed]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => {
      setHeroImageLoaded((loaded) => loaded || true);
    }, 2800);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  const dismissShiviIntro = useCallback(() => {
    setShiviIntroOpen(false);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans">
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col">
        <div
          className={`kyc-pending-hero-card relative isolate mx-auto flex min-h-0 w-full flex-1 flex-col ${HERO_MIN_HEIGHT}`}
        >
          <KycTopNavHeader
            transparent
            endSlot={
              <div className="flex shrink-0 items-center gap-2">
                <div className={cn(shiviIntroOpen && "invisible")} aria-hidden={shiviIntroOpen}>
                  <GetHelpPillButton />
                </div>
                <MenuOptionsButton onClick={() => setManageBookingOpen(true)} />
              </div>
            }
          />
          <AuroraLightLayer />
          <div className={`relative z-10 flex min-h-0 w-full flex-1 flex-col items-center px-5 pb-10 ${HERO_ICON_TOP_PT}`}>
            <div className="relative h-20 w-20 shrink-0">
              <Image
                src={KYC_ASSETS.kycHero}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20"
                priority
                unoptimized
                onLoadingComplete={() => setHeroImageLoaded(true)}
              />
            </div>

            <div className={`${HERO_ILLUSTRATION_TO_COPY_MT} flex w-full flex-col text-center`}>
              <div className={`flex w-full flex-col ${HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS}`}>
                {reduceMotion ? (
                  <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]">
                    {KYC_HEADLINE}
                  </h1>
                ) : (
                  <WordByWordLine
                    as="h1"
                    ariaLabel={KYC_HEADLINE}
                    text={KYC_HEADLINE}
                    wordDelayMs={HEADLINE_WORD_DELAY_MS}
                    wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                    className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                    onComplete={onHeadlineComplete}
                    startWhen={heroImageLoaded}
                  />
                )}
                <p
                  className={`text-sm font-normal leading-[22px] text-[#4b4b4b] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                    showSubline ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!showSubline}
                >
                  {KYC_SUBLINE}
                </p>
              </div>
              <div
                className={`mt-6 flex items-center gap-2 rounded-2xl border border-[#E8E8E8] bg-white px-3 py-3 text-left transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showSubline ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showSubline}
              >
                <Image
                  src={lockIcon}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0 object-contain"
                  unoptimized
                />
                <p className="text-xs leading-[18px] text-[#121212]">{KYC_INFO_BOX}</p>
              </div>
            </div>

            <div className="mt-auto w-full pt-8">
              <p
                className={`text-center text-xs font-medium leading-[18px] text-[#d16900] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showWarning ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showWarning}
              >
                {DEADLINE_LINE}
              </p>
              <button
                type="button"
                className={`primary-cta mt-4 transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 ${
                  showCta ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                tabIndex={showCta ? 0 : -1}
                onClick={() => router.push("/kyc/upload")}
              >
                Start verification • Takes 2 minutes
              </button>
            </div>
          </div>
        </div>
      </div>

      <ShiviIntroBottomSheet open={shiviIntroOpen} onClose={dismissShiviIntro} />
      <ManageBookingBottomSheet open={manageBookingOpen} onClose={() => setManageBookingOpen(false)} />
    </div>
  );
}
