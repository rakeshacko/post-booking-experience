import type { StaticImageData } from "next/image";

import cameraIcon from "@/assets/Camera.svg";
import digilockerLogo from "@/assets/Digilocker.png";
import fileIcon from "@/assets/file.svg";
import galleryIcon from "@/assets/image.svg";

export const KYC_UPLOAD_HEADLINE = "Upload your PAN and Aadhaar";

export const KYC_UPLOAD_DIGILOCKER_FETCH_LABEL = "Fetch from DigiLocker";

export const KYC_UPLOAD_DIGILOCKER_COLOR = "#643bfc";

export const KYC_UPLOAD_INFO_TIPS = [
  "The name on the Aadhaar and PAN should match",
  "The address on your Aadhaar should match the city your car is registered in",
] as const;

export const KYC_UPLOAD_SUBMIT_LABEL = "Submit documents";

export const KYC_UPLOAD_ADD_MORE_COLOR = "#1b73e8";

/** Card title on document upload sections (14px medium). */
export const DOCUMENT_UPLOAD_CARD_TITLE_CLASS =
  "text-sm font-medium leading-5 text-[#121212]";

export type KycDocumentKind = "aadhaar" | "pan";

export type KycUploadSource = "camera" | "gallery" | "file" | "digilocker";

export type KycDocumentDefinition = {
  kind: KycDocumentKind;
  title: string;
  description: string;
  allowMultiple: boolean;
};

export const KYC_DOCUMENTS: KycDocumentDefinition[] = [
  {
    kind: "aadhaar",
    title: "Aadhaar card",
    description: "Upload clear images of the front and back of your Aadhaar card",
    allowMultiple: true,
  },
  {
    kind: "pan",
    title: "PAN card",
    description: "Upload a clear image of your PAN",
    allowMultiple: false,
  },
];

/** Card config for shared `DocumentUploadDocumentCards` (DigiLocker CTA above Aadhaar only). */
export const KYC_UPLOAD_CARD_DEFINITIONS = KYC_DOCUMENTS.map((doc) => ({
  kind: doc.kind,
  title: doc.title,
  description: doc.description,
  allowMultiple: doc.allowMultiple,
  showDigilockerFetch: doc.kind === "aadhaar",
}));

export type KycUploadSourceOption = {
  id: KycUploadSource;
  label: string;
  iconSrc: string | StaticImageData;
};

export const KYC_UPLOAD_SOURCE_OPTIONS: KycUploadSourceOption[] = [
  { id: "camera", label: "Take a photo", iconSrc: cameraIcon },
  { id: "gallery", label: "Upload from gallery", iconSrc: galleryIcon },
  { id: "file", label: "Upload file", iconSrc: fileIcon },
  { id: "digilocker", label: "Fetch from Digilocker", iconSrc: digilockerLogo },
];

export function getKycUploadSourceOptions(includeDigilocker = true): KycUploadSourceOption[] {
  if (includeDigilocker) return KYC_UPLOAD_SOURCE_OPTIONS;
  return KYC_UPLOAD_SOURCE_OPTIONS.filter((option) => option.id !== "digilocker");
}

export const KYC_UPLOAD_DIGILOCKER_LOGO = digilockerLogo;

/** Demo filenames after a mock upload (no real file picker). */
export const KYC_MOCK_UPLOAD_NAMES = [
  "Image1234.png",
  "Aadhaar_front.jpg",
  "PAN_card.pdf",
  "Document_scan.png",
] as const;
