/** Shared copy for booking / manage-booking car summary cards. */
export const DEMO_BOOKING_ID = "AD-1322";
export const BOOKING_CAR_TITLE = "Hyundai Creta";
export const BOOKING_CAR_VARIANT = "1.5 X-Line AT Diesel";
export const BOOKING_CAR_COLOR = "Starry Night";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Days from today to the express and standard delivery dates, so the dates stay ahead of whenever the app is opened. */
export const EXPRESS_DELIVERY_DAYS = 21;
export const STANDARD_DELIVERY_DAYS = 45;

/** "18 Nov '26" (or "18 Nov" without the year), `days` from today. */
export function deliveryDateFromToday(days: number, withYear = true): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return withYear ? `${date} '${String(d.getFullYear()).slice(2)}` : date;
}

export const BOOKING_EXPRESS_DELIVERY_LINE = `Express delivery by ${deliveryDateFromToday(EXPRESS_DELIVERY_DAYS)}`;
