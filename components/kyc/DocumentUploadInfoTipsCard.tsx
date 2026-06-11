import Image from "next/image";

import tickIcon from "@/assets/tick.svg";

/** Gap from page title to tips card — shared across KYC and loan document upload. */
export const DOCUMENT_UPLOAD_TITLE_TO_TIPS_CLASS = "mt-6";

/** Gap from tips/banner block to document cards — shared across upload flows. */
export const DOCUMENT_UPLOAD_TIPS_TO_SECTIONS_CLASS = "mt-6";

type DocumentUploadInfoTipsCardProps = {
  tips: readonly string[];
};

export function DocumentUploadInfoTipsCard({ tips }: DocumentUploadInfoTipsCardProps) {
  return (
    <div className="rounded-2xl bg-[#f5f5f5] px-4 py-3.5">
      <ul className="flex flex-col gap-2">
        {tips.map((tip) => (
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
  );
}
