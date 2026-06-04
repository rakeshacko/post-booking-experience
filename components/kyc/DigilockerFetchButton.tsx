import Image from "next/image";

import {
  KYC_UPLOAD_DIGILOCKER_COLOR,
  KYC_UPLOAD_DIGILOCKER_FETCH_LABEL,
  KYC_UPLOAD_DIGILOCKER_LOGO,
} from "@/components/kyc/kyc-upload-content";

type DigilockerFetchButtonProps = {
  onClick: () => void;
  className?: string;
};

export function DigilockerFetchButton({ onClick, className = "mb-4" }: DigilockerFetchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#643bfc]/25 bg-[#643bfc]/5 px-4 py-3 text-xs font-medium leading-[18px] transition-colors hover:border-[#643bfc]/40 hover:bg-[#643bfc]/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#643bfc]/30 focus-visible:ring-offset-2 ${className}`}
      style={{ color: KYC_UPLOAD_DIGILOCKER_COLOR }}
    >
      <span>{KYC_UPLOAD_DIGILOCKER_FETCH_LABEL}</span>
      <span className="relative inline-block h-5 w-5 shrink-0" aria-hidden>
        <Image
          src={KYC_UPLOAD_DIGILOCKER_LOGO}
          alt=""
          fill
          className="object-contain"
          unoptimized
          sizes="20px"
        />
      </span>
    </button>
  );
}
