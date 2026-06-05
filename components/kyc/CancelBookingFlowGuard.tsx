"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCancelBookingFlowRedirectTarget } from "@/lib/experience-flow-journey";

type CancelBookingFlowGuardProps = {
  children: React.ReactNode;
};

/**
 * Redirects when cancel-booking routes are opened outside the cancel-no-charges demo flow.
 */
export function CancelBookingFlowGuard({ children }: CancelBookingFlowGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const target = getCancelBookingFlowRedirectTarget(pathname);
    if (target) {
      router.replace(target);
    }
  }, [pathname, router]);

  return children;
}
