"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { KycPanAadhaarDocumentUploadSections } from "@/components/kyc/KycPanAadhaarDocumentUploadSections";
import {
  KYC_UPLOAD_HEADLINE,
  KYC_UPLOAD_SUBMIT_LABEL,
} from "@/components/kyc/kyc-upload-content";
import { PaymentSuccessStagger } from "@/components/ui/stagger-container";
import { writeConciergeEcho } from "@/lib/concierge/echo";
import {
  createEmptyKycUploads,
  readKycUploadState,
  writeKycUploadState,
  type KycUploadsState,
} from "@/lib/kyc-upload-state";

const STAGGER_HEADLINE = 0.08;
const STAGGER_INFO_BOX = 0.16;
const STAGGER_AADHAAR = 0.24;
const STAGGER_PAN = 0.32;
const STAGGER_CTA = 0.4;

/**
 * KYC document upload — Figma nodes 2501:8136 (default), 2502:8901 / 2506:17851 (uploaded).
 */
export function KycDocumentUploadScreen() {
  const router = useRouter();
  const mockUploadCounterRef = useRef(0);
  const hasHydratedUploadsRef = useRef(false);
  const [uploads, setUploads] = useState<KycUploadsState>(createEmptyKycUploads);

  useEffect(() => {
    const stored = readKycUploadState();
    if (stored) {
      setUploads(stored.uploads);
      mockUploadCounterRef.current = stored.mockUploadCounter;
    }
    hasHydratedUploadsRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasHydratedUploadsRef.current) return;
    writeKycUploadState({
      uploads,
      mockUploadCounter: mockUploadCounterRef.current,
    });
  }, [uploads]);

  const canSubmit = uploads.aadhaar.length > 0 && uploads.pan.length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    writeConciergeEcho("Documents sent");
    router.push("/kyc/documents-received");
  }, [canSubmit, router]);

  const staggerByKind = useMemo(
    () =>
      ({
        aadhaar: STAGGER_AADHAAR,
        pan: STAGGER_PAN,
      }) as Record<string, number>,
    [],
  );

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-32 pt-2">
        <PaymentSuccessStagger delay={STAGGER_HEADLINE}>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
            {KYC_UPLOAD_HEADLINE}
          </h1>
        </PaymentSuccessStagger>

        <KycPanAadhaarDocumentUploadSections
          uploads={uploads}
          onUploadsChange={setUploads}
          mockUploadCounterRef={mockUploadCounterRef}
          wrapTips={(node) => (
            <PaymentSuccessStagger delay={STAGGER_INFO_BOX}>{node}</PaymentSuccessStagger>
          )}
          wrapCard={(kind, card) => (
            <PaymentSuccessStagger delay={staggerByKind[kind] ?? STAGGER_AADHAAR}>
              {card}
            </PaymentSuccessStagger>
          )}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white px-5 pb-5 pt-3">
        <PaymentSuccessStagger className="mx-auto w-full max-w-[640px]" delay={STAGGER_CTA}>
          <button
            type="button"
            disabled={!canSubmit}
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#a0a0a0] disabled:opacity-100 disabled:hover:bg-[#a0a0a0]"
            onClick={handleSubmit}
          >
            {KYC_UPLOAD_SUBMIT_LABEL}
          </button>
        </PaymentSuccessStagger>
      </div>
    </div>
  );
}
