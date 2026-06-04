import Image from "next/image";
import type { ReactNode } from "react";

import { publicAssetPath } from "@/lib/public-asset-path";

const BULLET_ICON = publicAssetPath("tick.svg");

/** Grey container + tick bullets — shared by payment / modify confirm bottom sheets. */
export const BOTTOM_SHEET_CONFIRM_BULLET_LIST_CLASS =
  "mt-4 w-full list-none space-y-[12px] rounded-2xl bg-[#f5f5f5] p-4";

type BottomSheetConfirmBulletListProps = {
  id?: string;
  points: readonly (string | ReactNode)[];
};

export function BottomSheetConfirmBulletList({ id, points }: BottomSheetConfirmBulletListProps) {
  return (
    <ul id={id} className={BOTTOM_SHEET_CONFIRM_BULLET_LIST_CLASS}>
      {points.map((line, index) => (
        <li key={index} className="flex gap-2">
          <span className="relative mt-0.5 h-5 w-5 shrink-0" aria-hidden>
            <Image
              src={BULLET_ICON}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
              unoptimized
              sizes="20px"
            />
          </span>
          <p className="min-w-0 flex-1 text-left text-xs font-normal leading-[18px] text-[#121212]">
            {line}
          </p>
        </li>
      ))}
    </ul>
  );
}
