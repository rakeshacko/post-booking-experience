"use client";

import Image from "next/image";

import {
  DOCUMENT_UPLOAD_CARD_TITLE_CLASS,
  KYC_UPLOAD_ADD_MORE_COLOR,
} from "@/components/kyc/kyc-upload-content";

import deleteIcon from "@/assets/Delete.svg";
import done01Icon from "@/assets/done 01.png";
import squarePlusIcon from "@/assets/square-plus.svg";
import uploadIcon from "@/assets/upload.svg";

/** Figma 2506:17851 — gap from description to first upload row. */
const DESCRIPTION_TO_UPLOAD_GAP_CLASS = "mt-4";

/** Figma 2506:17851 — gap from last upload row to “Add more”. */
const UPLOAD_TO_ADD_MORE_GAP_CLASS = "mt-4";

export type DocumentUploadFile = {
  id: string;
  name: string;
};

export type DocumentUploadSectionProps = {
  title: string;
  description?: string;
  allowMultiple?: boolean;
  files: DocumentUploadFile[];
  onUploadClick: () => void;
  onAddMoreClick?: () => void;
  onRemove: (fileId: string) => void;
};

function UploadSuccessBadge() {
  return (
    <span className="relative h-6 w-6 shrink-0">
      <Image src={done01Icon} alt="" fill className="object-contain" unoptimized sizes="24px" />
    </span>
  );
}

function UploadFileButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${DESCRIPTION_TO_UPLOAD_GAP_CLASS} flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#e8e8e8] bg-white transition-colors hover:border-[#c4c4c4] hover:bg-[#fafafa] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2`}
    >
      <span className="relative h-6 w-6 shrink-0">
        <Image src={uploadIcon} alt="" fill className="object-contain" unoptimized sizes="24px" />
      </span>
      <span className="text-sm font-normal leading-5 text-[#121212]">Upload file</span>
    </button>
  );
}

function UploadedFileRow({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="relative flex h-12 items-center gap-2 rounded-lg border border-dashed border-[#e8e8e8] bg-[#f5f5f5] px-[11.5px]">
      <UploadSuccessBadge />
      <span className="min-w-0 flex-1 truncate text-sm leading-5 text-[#121212]">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="cta-ghost flex size-5 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
        aria-label={`Remove ${name}`}
      >
        <span className="relative h-5 w-5">
          <Image src={deleteIcon} alt="" fill className="object-contain" unoptimized sizes="20px" />
        </span>
      </button>
    </div>
  );
}

export function DocumentUploadSection({
  title,
  description,
  allowMultiple = false,
  files,
  onUploadClick,
  onAddMoreClick,
  onRemove,
}: DocumentUploadSectionProps) {
  const handleAddMore = onAddMoreClick ?? onUploadClick;

  return (
    <section className="rounded-2xl bg-white card-elevated px-[15px] pb-[15px] pt-[15px]">
      <p className={DOCUMENT_UPLOAD_CARD_TITLE_CLASS}>{title}</p>
      {description ? (
        <p className="mt-1 w-full text-xs leading-[18px] text-[#757575]">{description}</p>
      ) : null}

      {files.length > 0 ? (
        <div className={`${DESCRIPTION_TO_UPLOAD_GAP_CLASS} flex flex-col gap-3`}>
          {files.map((file) => (
            <UploadedFileRow key={file.id} name={file.name} onRemove={() => onRemove(file.id)} />
          ))}
        </div>
      ) : null}

      {files.length === 0 ? <UploadFileButton onClick={onUploadClick} /> : null}

      {allowMultiple && files.length > 0 ? (
        <button
          type="button"
          onClick={handleAddMore}
          className={`${UPLOAD_TO_ADD_MORE_GAP_CLASS} flex h-5 items-center gap-2 self-start p-0 text-sm font-medium leading-5 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2`}
          style={{ color: KYC_UPLOAD_ADD_MORE_COLOR }}
        >
          <span className="relative h-5 w-5 shrink-0">
            <Image
              src={squarePlusIcon}
              alt=""
              fill
              className="object-contain"
              unoptimized
              sizes="20px"
            />
          </span>
          <span>Add more</span>
        </button>
      ) : null}
    </section>
  );
}
