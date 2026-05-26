"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  BUYING_GUIDE_STEP_COUNT,
  type BuyingGuideStep,
} from "@/components/kyc/buying-guide-content";
import { PaymentSuccessStagger } from "@/components/ui/stagger-container";
import { buyingGuideNextPath } from "@/lib/buying-guide-urls";

/** Sequential reveal — image → copy → CTA (header + progress are static in layout). */
const STAGGER_IMAGE = 0.1;
const STAGGER_STEP_LABEL = 0.2;
const STAGGER_TITLE = 0.28;
const STAGGER_BODY = 0.36;
const STAGGER_CTA = 0.44;

type BuyingGuideScreenProps = {
  step: BuyingGuideStep;
};

/**
 * Post-booking buying process onboarding — Figma steps 2460:7661 → 2460:7830.
 */
export function BuyingGuideScreen({ step }: BuyingGuideScreenProps) {
  const router = useRouter();
  const nextHref = buyingGuideNextPath(step.step);

  return (
    <>
      <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col overflow-hidden px-5 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-2">
        <PaymentSuccessStagger
          key={`image-${step.step}`}
          className="relative h-[360px] w-full shrink-0 overflow-hidden rounded-2xl bg-[#f5f5f5]"
          delay={STAGGER_IMAGE}
        >
          <div className="relative h-full w-full" aria-hidden={step.imageSrc == null}>
            {step.imageSrc != null ? (
              <Image
                src={step.imageSrc}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
                priority={step.step === 1}
              />
            ) : null}
          </div>
        </PaymentSuccessStagger>

        <div className="mt-8 flex shrink-0 flex-col gap-3" key={`copy-${step.step}`}>
          <PaymentSuccessStagger delay={STAGGER_STEP_LABEL}>
            <p className="text-sm font-medium uppercase leading-5 text-[#0fa457]">
              Step {step.step} of {BUYING_GUIDE_STEP_COUNT}
            </p>
          </PaymentSuccessStagger>
          <PaymentSuccessStagger delay={STAGGER_TITLE}>
            <h1 className="text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]">
              {step.title}
            </h1>
          </PaymentSuccessStagger>
          <PaymentSuccessStagger delay={STAGGER_BODY}>
            <p className="text-base font-normal leading-6 text-[#4b4b4b]">{step.body}</p>
          </PaymentSuccessStagger>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-transparent bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <PaymentSuccessStagger
          key={`cta-${step.step}`}
          className="mx-auto w-full max-w-[640px]"
          delay={STAGGER_CTA}
        >
          <button
            type="button"
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2"
            onClick={() => router.push(nextHref)}
          >
            {step.ctaLabel}
          </button>
        </PaymentSuccessStagger>
      </div>
    </>
  );
}
