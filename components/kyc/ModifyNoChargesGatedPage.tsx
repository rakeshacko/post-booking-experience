"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  getExperienceFlowJourneyRedirectTarget,
  type ModifyNoChargesJourneyContext,
} from "@/lib/experience-flow-journey";

type ModifyNoChargesGatedPageProps = {
  children: React.ReactNode;
};

function ModifyNoChargesGatedPageInner({ children }: ModifyNoChargesGatedPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const context: ModifyNoChargesJourneyContext = {
      returnSource: searchParams.get("return_source"),
      bookingConfirmedSource: searchParams.get("source"),
    };
    const target = getExperienceFlowJourneyRedirectTarget(pathname, undefined, context);
    if (target) {
      router.replace(target);
    }
  }, [pathname, router, searchParams]);

  return children;
}

/**
 * Redirects when modify-no-charges or cancel-no-charges demo flows hit disallowed routes.
 * Modify-no-charges → `/kyc`; cancel-no-charges → `/kyc/verification-in-progress`.
 * Allows `/kyc/booking-confirmed?source=payment&return_source=modify-selection` after modify-selection pay.
 */
export function ModifyNoChargesGatedPage({ children }: ModifyNoChargesGatedPageProps) {
  return (
    <Suspense fallback={children}>
      <ModifyNoChargesGatedPageInner>{children}</ModifyNoChargesGatedPageInner>
    </Suspense>
  );
}
