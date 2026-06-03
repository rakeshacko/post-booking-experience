"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetPortalProps = {
  children: ReactNode;
};

/** Renders bottom-sheet overlays on `document.body` so they sit above sticky nav (z-20). */
export function BottomSheetPortal({ children }: BottomSheetPortalProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (portalTarget == null) return null;
  return createPortal(children, portalTarget);
}
