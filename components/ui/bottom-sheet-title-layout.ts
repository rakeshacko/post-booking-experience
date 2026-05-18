/**
 * Content row inside a `max-w-[360px]` sheet with `px-5` is ~320px wide.
 * - With a hero illustration, the title can use the full row (`w-[320px]`); no `pr-12`.
 * - Without an illustration, keep the title to `w-[272px]` (320 − 48) so the absolute
 *   close control has its gutter without extra padding on the heading.
 */
export const bottomSheetTitleWidthWithIllustration = "w-[320px] max-w-full";
export const bottomSheetTitleWidthWithoutIllustration = "w-[272px] max-w-full";
