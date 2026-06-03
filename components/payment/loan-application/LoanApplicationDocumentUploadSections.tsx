"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { DocumentUploadSection } from "@/components/kyc/DocumentUploadSection";
import { KycUploadSourceBottomSheet } from "@/components/kyc/KycUploadSourceBottomSheet";
import { KYC_MOCK_UPLOAD_NAMES, type KycUploadSource } from "@/components/kyc/kyc-upload-content";
import { LoanApplicationPageStagger } from "@/components/payment/loan-application/LoanApplicationPageStagger";
import { LOAN_APPLICATION_STAGGER_MS } from "@/components/payment/loan-application/loan-application-layout";
import {
  LOAN_APPLICATION_DOCUMENTS_VERIFIED_BANNER,
  LOAN_APPLICATION_FINANCIAL_DOCUMENTS,
} from "@/lib/loan-application-documents-content";
import type {
  LoanApplicationDocumentKind,
  LoanApplicationDocumentsState,
  LoanApplicationDocumentUploadSource,
  LoanApplicationUploadedFile,
} from "@/lib/loan-application-documents-state";

import tickIcon from "@/assets/tick.svg";

function nextMockFilename(uploadIndex: number): string {
  return KYC_MOCK_UPLOAD_NAMES[uploadIndex % KYC_MOCK_UPLOAD_NAMES.length];
}

function toLoanUploadSource(source: KycUploadSource): LoanApplicationDocumentUploadSource {
  if (source === "digilocker") return "file";
  return source;
}

function VerifiedDocumentsBanner() {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#ebfbee] px-4 py-2">
      <span className="relative h-5 w-5 shrink-0">
        <Image src={tickIcon} alt="" fill className="object-contain" unoptimized sizes="20px" />
      </span>
      <p className="text-xs font-normal leading-[18px] text-[#121212]">
        {LOAN_APPLICATION_DOCUMENTS_VERIFIED_BANNER}
      </p>
    </div>
  );
}

type LoanApplicationDocumentUploadSectionsProps = {
  uploads: LoanApplicationDocumentsState;
  onUploadsChange: (next: LoanApplicationDocumentsState) => void;
};

export function LoanApplicationDocumentUploadSections({
  uploads,
  onUploadsChange,
}: LoanApplicationDocumentUploadSectionsProps) {
  const mockUploadCounterRef = useRef(0);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<LoanApplicationDocumentKind | null>(null);

  const openSourceSheet = useCallback((kind: LoanApplicationDocumentKind) => {
    setActiveDocument(kind);
    setSourceSheetOpen(true);
  }, []);

  const handleMockUpload = useCallback(
    (source: KycUploadSource) => {
      if (activeDocument == null) return;
      const uploadIndex = mockUploadCounterRef.current;
      mockUploadCounterRef.current += 1;
      const newFile: LoanApplicationUploadedFile = {
        id: `${activeDocument}-${uploadIndex}-${Date.now()}`,
        name: nextMockFilename(uploadIndex),
        source: toLoanUploadSource(source),
      };
      onUploadsChange({
        ...uploads,
        [activeDocument]: [...uploads[activeDocument], newFile],
      });
    },
    [activeDocument, onUploadsChange, uploads],
  );

  const handleRemove = useCallback(
    (kind: LoanApplicationDocumentKind, fileId: string) => {
      onUploadsChange({
        ...uploads,
        [kind]: uploads[kind].filter((file) => file.id !== fileId),
      });
    },
    [onUploadsChange, uploads],
  );

  const cardStaggerBase = LOAN_APPLICATION_STAGGER_MS.documentsAadhaar;

  return (
    <>
      <LoanApplicationPageStagger delayMs={LOAN_APPLICATION_STAGGER_MS.documentsInfo}>
        <VerifiedDocumentsBanner />
      </LoanApplicationPageStagger>

      <div className="mt-6 flex flex-col gap-4">
        {LOAN_APPLICATION_FINANCIAL_DOCUMENTS.map((doc, index) => (
          <LoanApplicationPageStagger
            key={doc.kind}
            delayMs={cardStaggerBase + index * LOAN_APPLICATION_STAGGER_MS.sectionStep}
          >
            <DocumentUploadSection
              title={doc.title}
              description={doc.description}
              allowMultiple
              files={uploads[doc.kind]}
              onUploadClick={() => openSourceSheet(doc.kind)}
              onAddMoreClick={() => openSourceSheet(doc.kind)}
              onRemove={(fileId) => handleRemove(doc.kind, fileId)}
            />
          </LoanApplicationPageStagger>
        ))}
      </div>

      <KycUploadSourceBottomSheet
        open={sourceSheetOpen}
        onClose={() => setSourceSheetOpen(false)}
        onSelect={handleMockUpload}
        includeDigilocker={false}
      />
    </>
  );
}
