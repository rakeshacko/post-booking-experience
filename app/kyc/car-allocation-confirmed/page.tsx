"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KycCarAllocationConfirmedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/car-allocation/confirmed");
  }, [router]);

  return null;
}
