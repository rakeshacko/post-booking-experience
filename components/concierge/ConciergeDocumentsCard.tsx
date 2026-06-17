"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import { KycUploadSourceBottomSheet } from "@/components/kyc/KycUploadSourceBottomSheet";
import {
  KYC_UPLOAD_DIGILOCKER_LOGO,
  type KycDocumentKind,
  type KycUploadSource,
} from "@/components/kyc/kyc-upload-content";
import {
  appendKycDigilockerPanAadhaarUploads,
  appendKycMockUpload,
} from "@/lib/kyc-mock-upload";
import type { KycUploadsState } from "@/lib/kyc-upload-state";
import { ShimmerInfoCard } from "@/components/ui/ShimmerInfoCard";
import { cn } from "@/lib/utils";

type ConciergeDocumentsCardProps = {
  uploads: KycUploadsState;
  onUploadsChange: (next: KycUploadsState) => void;
  /** Persists mock filename index with parent session state. */
  mockUploadCounterRef: React.MutableRefObject<number>;
};

function CheckBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="#e7f6ee" />
      <path
        d="M7.5 12.2l3 3L16.5 9"
        stroke="#0fa457"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="flex h-10 items-center gap-2 rounded-lg bg-[#f5f5f5] px-3">
      <CheckBadge />
      <span className="min-w-0 flex-1 truncate text-[13px] leading-[18px] text-[#121212]">
        {name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="cta-ghost flex size-6 shrink-0 items-center justify-center rounded text-[#757575]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

type DocumentRowProps = {
  title: string;
  hint: string;
  files: { id: string; name: string }[];
  allowMultiple?: boolean;
  onUpload: () => void;
  onRemove: (fileId: string) => void;
};

function DocumentRow({ title, hint, files, allowMultiple, onUpload, onRemove }: DocumentRowProps) {
  const hasFiles = files.length > 0;
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold leading-5 text-[#121212]">{title}</p>
            {hasFiles ? <CheckBadge /> : null}
          </div>
          <p className="mt-0.5 text-xs leading-[18px] text-[#757575]">{hint}</p>
        </div>
        {!hasFiles ? (
          <button
            type="button"
            onClick={onUpload}
            className="cta-ghost flex h-9 shrink-0 items-center justify-center rounded-[10px] border border-[#121212] px-4 text-sm font-medium leading-5 text-[#121212]"
          >
            Upload
          </button>
        ) : null}
      </div>
      {hasFiles ? (
        <div className="mt-2.5 flex flex-col gap-2">
          {files.map((file) => (
            <FileChip key={file.id} name={file.name} onRemove={() => onRemove(file.id)} />
          ))}
          {allowMultiple ? (
            <button
              type="button"
              onClick={onUpload}
              className="self-start text-[13px] font-medium leading-[18px] text-[#1b73e8]"
            >
              + Add another photo
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The documents handover, as one card: DigiLocker (both documents, one tap)
 * leads; manual upload rows follow. Caveats and privacy live below as quiet
 * captions instead of standalone cards.
 */
export function ConciergeDocumentsCard({
  uploads,
  onUploadsChange,
  mockUploadCounterRef,
}: ConciergeDocumentsCardProps) {
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<KycDocumentKind | null>(null);

  const openSourceSheet = useCallback((kind: KycDocumentKind) => {
    setActiveDocument(kind);
    setSourceSheetOpen(true);
  }, []);

  const handleDigilockerFetchAll = useCallback(() => {
    onUploadsChange(appendKycDigilockerPanAadhaarUploads(uploads, mockUploadCounterRef));
  }, [mockUploadCounterRef, onUploadsChange, uploads]);

  const handleMockUpload = useCallback(
    (source: KycUploadSource) => {
      if (source === "digilocker") {
        handleDigilockerFetchAll();
        return;
      }
      if (activeDocument == null) return;
      onUploadsChange(
        appendKycMockUpload(uploads, activeDocument, source, mockUploadCounterRef),
      );
    },
    [activeDocument, handleDigilockerFetchAll, mockUploadCounterRef, onUploadsChange, uploads],
  );

  const handleRemove = useCallback(
    (kind: KycDocumentKind, fileId: string) => {
      onUploadsChange({
        ...uploads,
        [kind]: uploads[kind].filter((file) => file.id !== fileId),
      });
    },
    [onUploadsChange, uploads],
  );

  const allDone = uploads.aadhaar.length > 0 && uploads.pan.length > 0;

  return (
    <>
      {/* Pre-action caveat — must be read before files are picked, so it sits above the card. */}
      <ShimmerInfoCard lead="Quick check:">
        the name should match on both documents, and the Aadhaar address should be in Bengaluru,
        where your car gets registered.
      </ShimmerInfoCard>

      <div className="overflow-hidden rounded-2xl bg-white card-elevated">
        <button
          type="button"
          onClick={handleDigilockerFetchAll}
          className={cn(
            "flex w-full items-center gap-3 bg-[#f9f6ff] px-4 py-3.5 text-left transition-colors",
            "hover:bg-[#f3edfd] active:bg-[#efe9fb]"
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <span className="relative h-6 w-6">
              <Image
                src={KYC_UPLOAD_DIGILOCKER_LOGO}
                alt=""
                fill
                className="object-contain"
                unoptimized
                sizes="24px"
              />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-semibold leading-5 text-[#121212]">
                Fetch from DigiLocker
              </span>
              {allDone ? (
                <CheckBadge />
              ) : (
                <span className="shrink-0 rounded-full bg-[#efe9fb] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-3 tracking-[0.06em] text-[#5920c5]">
                  Fastest
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-xs leading-[18px] text-[#757575]">
              Both documents in one tap, no photos needed
            </span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-[#5920c5]">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-3 px-4 pb-1 pt-3" aria-hidden>
          <span className="h-px flex-1 bg-[#efefef]" />
          <span className="text-[10px] font-medium uppercase leading-4 tracking-[0.08em] text-[#a3a2a7]">
            or add them yourself
          </span>
          <span className="h-px flex-1 bg-[#efefef]" />
        </div>

        <DocumentRow
          title="Aadhaar card"
          hint="Front and back, clear photos"
          files={uploads.aadhaar}
          allowMultiple
          onUpload={() => openSourceSheet("aadhaar")}
          onRemove={(fileId) => handleRemove("aadhaar", fileId)}
        />
        <hr className="mx-4 border-0 border-t border-dashed border-[#ececec]" />
        <DocumentRow
          title="PAN card"
          hint="One clear photo"
          files={uploads.pan}
          onUpload={() => openSourceSheet("pan")}
          onRemove={(fileId) => handleRemove("pan", fileId)}
        />
      </div>

      <div className="px-1">
        <p className="flex items-start gap-2 text-xs leading-[18px] text-[#757575]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="mt-0.5 shrink-0">
            <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Encrypted, and used only for this purchase. Nobody else sees them.
        </p>
      </div>

      <KycUploadSourceBottomSheet
        open={sourceSheetOpen}
        onClose={() => setSourceSheetOpen(false)}
        onSelect={handleMockUpload}
      />
    </>
  );
}
