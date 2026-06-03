"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { DocumentUploadSection } from "@/components/kyc/DocumentUploadSection";
import { KycUploadSourceBottomSheet } from "@/components/kyc/KycUploadSourceBottomSheet";
import {
  KYC_DOCUMENTS,
  KYC_MOCK_UPLOAD_NAMES,
  KYC_UPLOAD_DIGILOCKER_COLOR,
  KYC_UPLOAD_DIGILOCKER_LINE,
  KYC_UPLOAD_DIGILOCKER_LOGO,
  KYC_UPLOAD_HEADLINE,
  KYC_UPLOAD_INFO_TIPS,
  KYC_UPLOAD_SUBMIT_LABEL,
  type KycDocumentKind,
  type KycUploadSource,
} from "@/components/kyc/kyc-upload-content";
import { PaymentSuccessStagger } from "@/components/ui/stagger-container";
import {
  createEmptyKycUploads,
  readKycUploadState,
  writeKycUploadState,
  type KycUploadedFile,
  type KycUploadsState,
} from "@/lib/kyc-upload-state";

import tickIcon from "@/assets/tick.svg";

const STAGGER_HEADLINE = 0.08;
const STAGGER_DIGILOCKER = 0.16;
const STAGGER_INFO_BOX = 0.24;
const STAGGER_AADHAAR = 0.32;
const STAGGER_PAN = 0.4;
const STAGGER_CTA = 0.48;

type UploadedFile = KycUploadedFile;

type UploadsState = KycUploadsState;

function createEmptyUploads(): UploadsState {
  return createEmptyKycUploads();
}

function nextMockFilename(uploadIndex: number): string {
  return KYC_MOCK_UPLOAD_NAMES[uploadIndex % KYC_MOCK_UPLOAD_NAMES.length];
}

/**
 * KYC document upload — Figma nodes 2501:8136 (default), 2502:8901 / 2506:17851 (uploaded).
 */
export function KycDocumentUploadScreen() {
  const router = useRouter();
  const mockUploadCounterRef = useRef(0);
  const hasHydratedUploadsRef = useRef(false);
  const [uploads, setUploads] = useState<UploadsState>(createEmptyUploads);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<KycDocumentKind | null>(null);

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

  const openSourceSheet = useCallback((kind: KycDocumentKind) => {
    setActiveDocument(kind);
    setSourceSheetOpen(true);
  }, []);

  const handleMockUpload = useCallback(
    (source: KycUploadSource) => {
      if (activeDocument == null) return;

      const uploadIndex = mockUploadCounterRef.current;
      mockUploadCounterRef.current += 1;

      const newFile: UploadedFile = {
        id: `${activeDocument}-${uploadIndex}-${Date.now()}`,
        name: nextMockFilename(uploadIndex),
        source,
      };

      setUploads((prev) => ({
        ...prev,
        [activeDocument]:
          activeDocument === "pan" ? [newFile] : [...prev[activeDocument], newFile],
      }));
    },
    [activeDocument],
  );

  const handleRemove = useCallback((kind: KycDocumentKind, fileId: string) => {
    setUploads((prev) => ({
      ...prev,
      [kind]: prev[kind].filter((file) => file.id !== fileId),
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    router.push("/kyc/documents-received");
  }, [canSubmit, router]);

  const staggerByKind = useMemo(
    () => ({
      aadhaar: STAGGER_AADHAAR,
      pan: STAGGER_PAN,
    }),
    [],
  );

  return (
    <div className="min-h-dvh bg-white font-sans">
      <KycTopNavHeader />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-32 pt-2">
        <PaymentSuccessStagger delay={STAGGER_HEADLINE}>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
            {KYC_UPLOAD_HEADLINE}
          </h1>
        </PaymentSuccessStagger>

        <PaymentSuccessStagger delay={STAGGER_DIGILOCKER}>
          <p
            className="mt-2 flex flex-wrap items-center gap-1.5 text-xs leading-[18px]"
            style={{ color: KYC_UPLOAD_DIGILOCKER_COLOR }}
          >
            <span>{KYC_UPLOAD_DIGILOCKER_LINE}</span>
            <span className="relative inline-block h-5 w-5 shrink-0">
              <Image
                src={KYC_UPLOAD_DIGILOCKER_LOGO}
                alt="DigiLocker"
                fill
                className="object-contain"
                unoptimized
                sizes="20px"
              />
            </span>
          </p>
        </PaymentSuccessStagger>

        <PaymentSuccessStagger delay={STAGGER_INFO_BOX}>
          <div className="mt-[25px] rounded-2xl bg-[#f5f5f5] px-4 py-4">
            <ul className="flex flex-col gap-2">
              {KYC_UPLOAD_INFO_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-left">
                  <span className="relative mt-0.5 h-5 w-5 shrink-0">
                    <Image
                      src={tickIcon}
                      alt=""
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="20px"
                    />
                  </span>
                  <span className="text-xs leading-[18px] text-[#121212]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </PaymentSuccessStagger>

        <div className="mt-6 flex flex-col gap-4">
          {KYC_DOCUMENTS.map((doc) => (
            <PaymentSuccessStagger key={doc.kind} delay={staggerByKind[doc.kind]}>
              <DocumentUploadSection
                title={doc.title}
                description={doc.description}
                allowMultiple={doc.allowMultiple}
                files={uploads[doc.kind]}
                onUploadClick={() => openSourceSheet(doc.kind)}
                onAddMoreClick={() => openSourceSheet(doc.kind)}
                onRemove={(fileId) => handleRemove(doc.kind, fileId)}
              />
            </PaymentSuccessStagger>
          ))}
        </div>
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

      <KycUploadSourceBottomSheet
        open={sourceSheetOpen}
        onClose={() => setSourceSheetOpen(false)}
        onSelect={handleMockUpload}
      />
    </div>
  );
}
