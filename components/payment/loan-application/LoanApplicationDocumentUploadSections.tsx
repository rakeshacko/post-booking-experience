"use client";

import { useCallback, useRef, useState } from "react";

import {
  DOCUMENT_UPLOAD_TIPS_TO_SECTIONS_CLASS,
  DOCUMENT_UPLOAD_TITLE_TO_TIPS_CLASS,
} from "@/components/kyc/DocumentUploadInfoTipsCard";
import { DocumentUploadDocumentCards } from "@/components/kyc/DocumentUploadDocumentCards";
import { DocumentUploadVerifiedBanner } from "@/components/kyc/DocumentUploadVerifiedBanner";
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

function nextMockFilename(uploadIndex: number): string {
  return KYC_MOCK_UPLOAD_NAMES[uploadIndex % KYC_MOCK_UPLOAD_NAMES.length];
}

const LOAN_UPLOAD_CARD_DEFINITIONS = LOAN_APPLICATION_FINANCIAL_DOCUMENTS.map((doc) => ({
  kind: doc.kind,
  title: doc.title,
  description: doc.description,
  allowMultiple: true,
}));

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

  const appendUpload = useCallback(
    (kind: LoanApplicationDocumentKind, source: LoanApplicationDocumentUploadSource) => {
      const uploadIndex = mockUploadCounterRef.current;
      mockUploadCounterRef.current += 1;
      const newFile: LoanApplicationUploadedFile = {
        id: `${kind}-${source}-${uploadIndex}-${Date.now()}`,
        name: nextMockFilename(uploadIndex),
        source,
      };
      onUploadsChange({
        ...uploads,
        [kind]: [...uploads[kind], newFile],
      });
    },
    [onUploadsChange, uploads],
  );

  const handleMockUpload = useCallback(
    (source: KycUploadSource) => {
      if (activeDocument == null || source === "digilocker") return;
      appendUpload(activeDocument, source);
    },
    [activeDocument, appendUpload],
  );

  const handleRemove = useCallback(
    (kind: string, fileId: string) => {
      if (
        kind !== "salarySlip" &&
        kind !== "bankStatement" &&
        kind !== "addressProof" &&
        kind !== "form16"
      ) {
        return;
      }
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
        <div className={DOCUMENT_UPLOAD_TITLE_TO_TIPS_CLASS}>
          <DocumentUploadVerifiedBanner message={LOAN_APPLICATION_DOCUMENTS_VERIFIED_BANNER} />
        </div>
      </LoanApplicationPageStagger>

      <div className={DOCUMENT_UPLOAD_TIPS_TO_SECTIONS_CLASS}>
        <DocumentUploadDocumentCards
          documents={LOAN_UPLOAD_CARD_DEFINITIONS}
          getFiles={(kind) => uploads[kind as LoanApplicationDocumentKind] ?? []}
          onUploadClick={(kind) => openSourceSheet(kind as LoanApplicationDocumentKind)}
          onRemove={handleRemove}
          wrapCard={(kind, card) => {
            const index = LOAN_APPLICATION_FINANCIAL_DOCUMENTS.findIndex((d) => d.kind === kind);
            return (
              <LoanApplicationPageStagger
                delayMs={cardStaggerBase + index * LOAN_APPLICATION_STAGGER_MS.sectionStep}
              >
                {card}
              </LoanApplicationPageStagger>
            );
          }}
        />
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
