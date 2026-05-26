import { BuyingGuideShell } from "@/components/kyc/BuyingGuideShell";

export default function BuyingGuideLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BuyingGuideShell>{children}</BuyingGuideShell>;
}
