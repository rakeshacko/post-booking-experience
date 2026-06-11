"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ModifySelectionConfirmBottomSheet } from "@/components/kyc/ModifySelectionConfirmBottomSheet";
import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";
import {
  MODIFY_SELECTION_OPTIONS,
  MODIFY_SELECTION_TITLE,
  resolveModifySelectionConfirmPoints,
  resolveModifySelectionSubline,
  type ModifySelectionChoiceId,
} from "@/lib/modify-selection-content";
import {
  modifySelectionCardStaggerDelay,
  MODIFY_SELECTION_STAGGER_MS,
} from "@/lib/modify-selection-stagger";

const { title: STAGGER_TITLE_MS, subtext: STAGGER_SUBTEXT_MS, firstCard: STAGGER_FIRST_OPTION_MS } =
  MODIFY_SELECTION_STAGGER_MS;

function RadioIndicator({ selected }: { selected: boolean }) {
  const src = selected ? PAYMENT_CHOOSE_ASSETS.radioOn : PAYMENT_CHOOSE_ASSETS.radioOff;
  return (
    <span className="relative h-4 w-4 shrink-0" aria-hidden>
      <Image src={src} alt="" fill className="object-contain" unoptimized sizes="16px" />
    </span>
  );
}

type ModifyOptionCardProps = {
  id: ModifySelectionChoiceId;
  selected: boolean;
  onSelect: () => void;
  illustrationSrc: string | import("next/image").StaticImageData;
  title: string;
  description: string;
};

function ModifyOptionCard({
  id,
  selected,
  onSelect,
  illustrationSrc,
  title,
  description,
}: ModifyOptionCardProps) {
  return (
    <button
      type="button"
      id={`modify-option-${id}`}
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-2xl border p-[15px] text-left transition-colors card-elevated ${
        selected ? "border-[#121212] bg-[#F5F5F5]" : "border-transparent bg-white"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src={illustrationSrc}
              alt=""
              fill
              className="object-contain"
              unoptimized
              sizes="48px"
            />
          </div>
          <RadioIndicator selected={selected} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-medium leading-6 text-[#121212]">{title}</p>
          <p className="mt-2 text-xs leading-[18px] text-[#4b4b4b]">{description}</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Modify booking — what to change (layout aligned with `ChoosePaymentOptionsScreen`).
 */
export function ChooseModifyBookingScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<ModifySelectionChoiceId>("colour");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [subline, setSubline] = useState(() => resolveModifySelectionSubline());

  useEffect(() => {
    setSubline(resolveModifySelectionSubline());
  }, []);

  const selectedOption = MODIFY_SELECTION_OPTIONS.find((o) => o.id === choice)!;

  const confirmPoints = useMemo(
    () => resolveModifySelectionConfirmPoints(choice),
    [choice],
  );

  const onContinue = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const onConfirmAgree = useCallback(() => {
    setConfirmOpen(false);
    router.push(selectedOption.continuePath);
  }, [router, selectedOption.continuePath]);

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader endSlot={<GetHelpPillButton />} />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_TITLE}
        </h1>

        <p
          className="payment-success-stagger mt-2 text-sm font-normal leading-[22px] text-[#4b4b4b]"
          style={{ animationDelay: `${STAGGER_SUBTEXT_MS}ms` }}
        >
          {subline}
        </p>

        <div
          className="mt-5 flex flex-col gap-4"
          role="group"
          aria-label="Modification options"
        >
          {MODIFY_SELECTION_OPTIONS.map((option, index) => (
            <div
              key={option.id}
              className="payment-success-stagger w-full"
              style={{
                animationDelay: `${modifySelectionCardStaggerDelay(index, STAGGER_FIRST_OPTION_MS)}ms`,
              }}
            >
              <ModifyOptionCard
                id={option.id}
                selected={choice === option.id}
                onSelect={() => setChoice(option.id)}
                illustrationSrc={option.illustrationSrc}
                title={option.title}
                description={option.description}
              />
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button type="button" onClick={onContinue} className="primary-cta w-full">
            {selectedOption.continueCtaLabel}
          </button>
        </div>
      </div>

      <ModifySelectionConfirmBottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmAgree}
        header={selectedOption.confirmHeader}
        points={confirmPoints}
        iconSrc={selectedOption.illustrationSrc}
        confirmCtaLabel={selectedOption.continueCtaLabel}
      />
    </div>
  );
}
