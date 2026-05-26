"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BUYING_GUIDE_ENTRY_PATH } from "@/lib/buying-guide-urls";

/** Legacy — Shivi RM intro removed; redirects to buying-guide step 1. */
export default function LegacyBookingSuccessNextPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(BUYING_GUIDE_ENTRY_PATH);
  }, [router]);

  return null;
}
