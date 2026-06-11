"use client";

import Image from "next/image";

import carBackgroundSmall from "@/assets/Car background small.png";
import editIcon from "@/assets/Edit.svg";
import { BOOKING_CAR_TITLE, BOOKING_CAR_VARIANT } from "@/components/kyc/booking-car-card-content";
import {
  BOOKING_EXPRESS_DELIVERY_TEXT_CLASS,
  BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
  splitBookingDeliveryLine,
} from "@/lib/experience-flow-content";
import { getModifySelectionCarCutoutForColour } from "@/lib/modify-selection-car-cutouts";
import { cn } from "@/lib/utils";

type ModifySelectionReviewSelectionCardProps = {
  colourId: string;
  colourName: string;
  deliveryLine: string;
  isExpressDelivery: boolean;
  onEditColour: () => void;
  onEditDelivery: () => void;
  /** When false, delivery row has no edit control (non-express colours). */
  showDeliveryEdit?: boolean;
  /** Overrides default Hyundai Creta title (different-car flow). */
  carTitle?: string;
  /** Overrides default variant subtitle (variant / different-car flow). */
  carVariant?: string;
  onEditVariant?: () => void;
  /** Different-car flow — change make & model. */
  onEditCar?: () => void;
};

function EditLinkButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-5 shrink-0 items-center justify-center rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20"
      aria-label={label}
    >
      <Image src={editIcon} alt="" width={20} height={20} className="size-5" unoptimized />
    </button>
  );
}

/**
 * Review selection hero — Figma 2696:9191 (car image, delivery/colour with edit).
 */
export function ModifySelectionReviewSelectionCard({
  colourId,
  colourName,
  deliveryLine,
  isExpressDelivery,
  onEditColour,
  onEditDelivery,
  showDeliveryEdit = true,
  carTitle,
  carVariant,
  onEditVariant,
  onEditCar,
}: ModifySelectionReviewSelectionCardProps) {
  const titleLabel = carTitle ?? BOOKING_CAR_TITLE;
  const variantLabel = carVariant ?? BOOKING_CAR_VARIANT;
  const deliveryParts = splitBookingDeliveryLine(deliveryLine);
  const deliveryTextClass = isExpressDelivery
    ? BOOKING_EXPRESS_DELIVERY_TEXT_CLASS
    : BOOKING_STANDARD_DELIVERY_TEXT_CLASS;

  return (
    <div className="overflow-hidden rounded-2xl bg-white card-elevated">
      <div className="relative h-[140px] w-full overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <Image
            src={carBackgroundSmall}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: "center 28%" }}
            sizes="(max-width: 640px) 100vw, 320px"
            unoptimized
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0) 68%, rgba(255,255,255,0.7) 100%), linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 25%)",
          }}
          aria-hidden
        />
        <div className="absolute left-1/2 top-[26px] h-[102px] w-[180px] -translate-x-1/2">
          <div className="relative mx-auto h-full w-[150px]">
            <Image
              src={getModifySelectionCarCutoutForColour(colourId)}
              alt=""
              fill
              className="object-contain object-bottom"
              sizes="180px"
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#e8e8e8] px-4 pb-4 pt-4">
        <div className="flex items-center gap-2">
          <p className="text-base font-medium leading-6 text-[#121212]">{titleLabel}</p>
          {onEditCar != null ? (
            <EditLinkButton label="Change make and model" onClick={onEditCar} />
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="shrink-0 text-xs leading-[18px] text-[#757575]">Variant:</span>
          <span className="text-xs font-medium leading-[18px] text-[#121212]">{variantLabel}</span>
          {onEditVariant != null ? (
            <EditLinkButton label="Change variant" onClick={onEditVariant} />
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="shrink-0 text-xs leading-[18px] text-[#757575]">Colour:</span>
          <span className="text-xs font-medium leading-[18px] text-[#121212]">{colourName}</span>
          <EditLinkButton label="Change colour" onClick={onEditColour} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs leading-[18px] text-[#757575]">Delivery:</span>
          <span className={cn("text-xs leading-[18px]", deliveryTextClass)}>
            {deliveryParts ? (
              <>
                {deliveryParts.prefix}
                <span className="font-semibold">{deliveryParts.date}</span>
              </>
            ) : (
              deliveryLine
            )}
          </span>
          {showDeliveryEdit ? (
            <EditLinkButton label="Change delivery" onClick={onEditDelivery} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
