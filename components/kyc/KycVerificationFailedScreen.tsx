"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import infoIcon from "@/assets/Info.svg";
import kycFailedHero from "@/assets/KYC failed.svg";
import menuIcon from "@/assets/menu.svg";
import {
  getKycVerificationFailedCopy,
  KYC_VERIFICATION_FAILED_CTA_WARNING,
  KYC_VERIFICATION_FAILED_UPLOAD_HREF,
  resolveKycVerificationFailureReason,
  type KycVerificationFailureReason,
} from "@/components/kyc/kyc-verification-failed-content";
import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ManageBookingBottomSheet } from "@/components/kyc/ManageBookingBottomSheet";
import { VerificationFailureReasonSwitcher } from "@/components/kyc/VerificationFailureReasonSwitcher";
import { WordByWordLine } from "@/components/payment/WordByWordLine";
import { AuroraLightLayer } from "@/components/ui/aurora-light-layer";
import { ShimmerInfoCard } from "@/components/ui/ShimmerInfoCard";
import {
  HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS,
  HERO_ILLUSTRATION_TO_COPY_MT,
} from "@/components/ui/success-screen-layout";

const HEADLINE_WORD_DELAY_MS = 135;
const HERO_FADE_DURATION_CLASS = "duration-[450ms]";
const SUBLINE_TO_CTA_DELAY_MS = 240;
const CTA_TO_WARNING_DELAY_MS = 480;
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
 * Unhappy path after verification-in-progress — only used when the verification-failed flow is active.
 */
export function KycVerificationFailedScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroArtReady, setHeroArtReady] = useState(false);
  const [showSubline, setShowSubline] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [manageBookingOpen, setManageBookingOpen] = useState(false);

  const initialReason = useMemo(
    () => resolveKycVerificationFailureReason(searchParams.get("reason")),
    [searchParams],
  );
  const [reason, setReason] = useState<KycVerificationFailureReason>(initialReason);

  useEffect(() => {
    setReason(resolveKycVerificationFailureReason(searchParams.get("reason")));
  }, [searchParams]);

  const copy = useMemo(() => getKycVerificationFailedCopy(reason), [reason]);

  const onReasonChange = useCallback(
    (next: KycVerificationFailureReason) => {
      setReason(next);
      const q = new URLSearchParams(searchParams.toString());
      q.set("reason", next);
      const qs = q.toString();
      router.replace(qs ? `/kyc/verification-failed?${qs}` : "/kyc/verification-failed", {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const onHeadlineComplete = useCallback(() => {
    setShowSubline(true);
    window.setTimeout(() => setShowCta(true), SUBLINE_TO_CTA_DELAY_MS);
    window.setTimeout(
      () => setShowWarning(true),
      SUBLINE_TO_CTA_DELAY_MS + CTA_TO_WARNING_DELAY_MS,
    );
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) {
      setHeroArtReady(true);
      setShowSubline(true);
      setShowCta(true);
      setShowWarning(true);
    }
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setTimeout(() => {
      setHeroArtReady((ready) => (ready ? ready : true));
    }, 2800);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  useEffect(() => {
    router.prefetch(KYC_VERIFICATION_FAILED_UPLOAD_HREF);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#f1f0f5] font-sans">
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col">
        <div
          className={`kyc-pending-hero-card relative isolate mx-auto flex min-h-0 w-full flex-1 flex-col ${HERO_MIN_HEIGHT}`}
        >
          <KycTopNavHeader
            transparent
            endSlot={
              <div className="flex shrink-0 items-center gap-2">
                <GetHelpPillButton />
                <MenuOptionsButton onClick={() => setManageBookingOpen(true)} />
              </div>
            }
          />
          <div className="relative z-20 w-full shrink-0 px-5 pb-3 pt-1">
            <VerificationFailureReasonSwitcher value={reason} onChange={onReasonChange} />
          </div>
          <AuroraLightLayer />
          <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center px-5 pb-10 pt-4">
            <div className="relative h-20 w-20 shrink-0">
              <Image
                src={kycFailedHero}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
                priority
                unoptimized
                onLoadingComplete={() => setHeroArtReady(true)}
              />
            </div>

            <div className={`${HERO_ILLUSTRATION_TO_COPY_MT} flex w-full flex-col text-center`}>
              <div className={`flex w-full flex-col ${HERO_ACTION_HEADLINE_SUBLINE_GAP_CLASS}`}>
                {reduceMotion ? (
                  <h1 className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]">
                    {copy.headline}
                  </h1>
                ) : (
                  <WordByWordLine
                    as="h1"
                    ariaLabel={copy.headline}
                    text={copy.headline}
                    wordDelayMs={HEADLINE_WORD_DELAY_MS}
                    wordOpacityDurationClassName={HERO_FADE_DURATION_CLASS}
                    className="text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
                    onComplete={onHeadlineComplete}
                    startWhen={heroArtReady}
                  />
                )}
                <p
                  className={`text-sm font-normal leading-[22px] text-[#4b4b4b] transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                    showSubline ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!showSubline}
                >
                  {copy.subline}
                </p>
              </div>
              {copy.infoBoxBoldPrefix != null || copy.infoBox != null ? (
                <div
                  className={`mt-6 flex items-center gap-3 rounded-2xl bg-white card-elevated px-3 py-3 text-left transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                    showSubline ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!showSubline}
                >
                  <span className="relative h-5 w-5 shrink-0">
                    <Image
                      src={infoIcon}
                      alt=""
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="20px"
                    />
                  </span>
                  <p className="text-xs leading-[18px] text-[#121212]">
                    {copy.infoBoxBoldPrefix ? (
                      <>
                        <span className="font-medium">{copy.infoBoxBoldPrefix}</span> {copy.infoBox}
                      </>
                    ) : (
                      copy.infoBox
                    )}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-auto w-full pt-8">
              <div
                className={`transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out ${
                  showWarning ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!showWarning}
              >
                <ShimmerInfoCard icon="alert">
                  {KYC_VERIFICATION_FAILED_CTA_WARNING}
                </ShimmerInfoCard>
              </div>
              <button
                type="button"
                className={`primary-cta mt-4 transition-opacity ${HERO_FADE_DURATION_CLASS} ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 ${
                  showCta ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                tabIndex={showCta ? 0 : -1}
                onClick={() => router.push(KYC_VERIFICATION_FAILED_UPLOAD_HREF)}
              >
                {copy.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <ManageBookingBottomSheet open={manageBookingOpen} onClose={() => setManageBookingOpen(false)} />
    </div>
  );
}
