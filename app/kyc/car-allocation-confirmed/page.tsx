"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isModifyNoChargesFlow } from "@/lib/experience-flow";
import { JOURNEY_PATHS } from "@/lib/journey-routes";

export default function KycCarAllocationConfirmedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      isModifyNoChargesFlow()
        ? JOURNEY_PATHS.kyc.hub
        : JOURNEY_PATHS.carAllocation.confirmed,
    );
  }, [router]);

  return null;
}
