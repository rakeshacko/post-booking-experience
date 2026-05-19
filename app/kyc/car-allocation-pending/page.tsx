"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KycCarAllocationPendingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/car-allocation/pending");
  }, [router]);

  return null;
}
