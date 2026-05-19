"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { DOCUMENTS_RECEIVED_ASSETS } from "@/components/kyc/kyc-documents-received-assets";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";

/** 104×104 illustration from `assets/Documents_received.svg`. */
function DocumentsSuccessIllustration() {
  return (
    <div className="relative mx-auto h-[104px] w-[104px] shrink-0" aria-hidden>
      <Image
        src={DOCUMENTS_RECEIVED_ASSETS.illustration}
        alt=""
        width={104}
        height={104}
        className="h-[104px] w-[104px] object-contain"
        unoptimized
        priority
      />
    </div>
  );
}

type KycDocumentsReceivedScreenProps = {
  /** Primary CTA destination (KYC flow defaults to processing). */
  okayHref?: string;
};

/**
 * Documents received — Figma Post-booking-experience / node 1880:6801.
 */
export function KycDocumentsReceivedScreen({
  okayHref = "/kyc/processing",
}: KycDocumentsReceivedScreenProps) {
  const router = useRouter();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#fafbfb] font-sans shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
      {/* Same light green wash as payment success (app/payment/page.tsx success phase) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-[#e8f8ef]/90 via-[#f4fbf7]/40 to-transparent transition-opacity duration-700"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-36 pt-4">
        <div className="flex w-full max-w-[640px] flex-col items-center gap-4 text-center">
          <DocumentsSuccessIllustration />

          <div
            className={`flex w-full flex-col items-center text-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
          >
            <h1 className="w-full text-[24px] font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
              Documents received
            </h1>
            <p className="w-full text-sm font-normal leading-5 text-[#4b4b4b]">
              Your documents are being verified by the bank
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-transparent bg-[#FFFFFF] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
        <div className="mx-auto w-full max-w-[640px]">
          <button
            type="button"
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
            onClick={() => router.push(okayHref)}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
