"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getModifySelectionFlowRedirectTarget } from "@/lib/experience-flow-journey";

type ModifySelectionFlowGuardProps = {
  children: React.ReactNode;
};

/**
 * Redirects when modify-selection routes are opened outside a modify-selection demo flow,
 * or before booking accepted in the modify-with-charges flow.
 */
export function ModifySelectionFlowGuard({ children }: ModifySelectionFlowGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const target = getModifySelectionFlowRedirectTarget(pathname);
    if (target) {
      router.replace(target);
    }
  }, [pathname, router]);

  return children;
}
