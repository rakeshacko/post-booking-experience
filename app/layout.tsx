import type { Metadata } from "next";
import "./globals.css";

import { EUCLID_FONT_ORIGIN, EUCLID_PRELOAD_FONT_FILES, euclidFontHref } from "@/lib/euclid-font-preload";
import { LiveBookingSync } from "@/components/live/LiveBookingSync";
import { AnimationProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "Post-booking experience",
  description: "ACKO Drive quote",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={EUCLID_FONT_ORIGIN} crossOrigin="anonymous" />
        {EUCLID_PRELOAD_FONT_FILES.map((file) => (
          <link
            key={file}
            rel="preload"
            href={euclidFontHref(file)}
            as="font"
            type="font/otf"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <AnimationProvider>
          <div className="relative mx-auto flex min-h-dvh w-full max-w-[640px] flex-col">
            {children}
          </div>
        </AnimationProvider>
        {/* Outside the per-route AnimationProvider key, so it isn't remounted (and
            doesn't re-route to the current stage) every time the customer navigates. */}
        <LiveBookingSync />
      </body>
    </html>
  );
}
