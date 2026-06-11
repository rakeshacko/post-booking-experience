import Image from "next/image";

import { SELF_FINANCE_HOW_IT_WORKS_STEPS } from "@/components/payment/self-finance-confirmed-content";

type SelfFinanceHowItWorksCardProps = {
  /** When false, omit the inner heading (e.g. bottom sheet already has a title). */
  showTitle?: boolean;
  /** `embedded` — grey fill for bottom sheet; default keeps bordered card on success screen. */
  variant?: "card" | "embedded";
};

export function SelfFinanceHowItWorksCard({
  showTitle = true,
  variant = "card",
}: SelfFinanceHowItWorksCardProps) {
  const isEmbedded = variant === "embedded";

  return (
    <div
      className={
        isEmbedded
          ? "w-full rounded-2xl bg-[#f5f5f5] p-5"
          : "w-full rounded-2xl bg-white card-elevated p-5"
      }
    >
      {showTitle && (
        <h2 className="mb-4 text-left text-sm font-medium leading-5 text-[#121212]">
          Here is how it works
        </h2>
      )}
      <div className={isEmbedded ? "space-y-5" : "space-y-4"}>
        {SELF_FINANCE_HOW_IT_WORKS_STEPS.map((step, index) => (
          <div key={index} className="flex gap-3">
            <div
              className={`relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                isEmbedded ? "bg-white" : "bg-[#f5f5f5]"
              }`}
            >
              <Image
                src={step.icon}
                alt=""
                width={20}
                height={20}
                className="object-contain"
                unoptimized
              />
            </div>
            <p
              className={`min-w-0 flex-1 text-left font-normal text-[#121212] ${
                isEmbedded ? "text-sm leading-5" : "text-xs leading-[18px]"
              }`}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
