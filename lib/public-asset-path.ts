import { BASE_PATH } from "@/lib/site-config";

export { BASE_PATH };

/** e.g. `public/assets/KYC.svg` → `/post-booking-experience/assets/KYC.svg` */
export function publicAssetPath(filename: string): string {
  return `${BASE_PATH}/assets/${encodeURIComponent(filename)}`;
}

/** e.g. `public/assets/kyc-booking-confirmed/car-cutout.png` */
export function publicAssetPathIn(subfolder: string, filename: string): string {
  return `${BASE_PATH}/assets/${subfolder}/${encodeURIComponent(filename)}`;
}
