"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { JOURNEY_PATHS } from "@/lib/journey-routes";

/**
 * Legacy — document upload now happens inline on the `/kyc` identity turn
 * (verification-failed re-upload links land here too).
 */
export default function LegacyKycUploadPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(JOURNEY_PATHS.kyc.hub);
  }, [router]);

  return null;
}
