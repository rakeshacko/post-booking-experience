import Image from "next/image";

import tickIcon from "@/assets/tick.svg";

type DocumentUploadVerifiedBannerProps = {
  message: string;
};

/** Green verified strip — loan wizard (PAN/Aadhaar already done) and similar flows. */
export function DocumentUploadVerifiedBanner({ message }: DocumentUploadVerifiedBannerProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[#ebfbee] px-4 py-2">
      <span className="relative h-5 w-5 shrink-0">
        <Image src={tickIcon} alt="" fill className="object-contain" unoptimized sizes="20px" />
      </span>
      <p className="text-xs font-normal leading-[18px] text-[#121212]">{message}</p>
    </div>
  );
}
