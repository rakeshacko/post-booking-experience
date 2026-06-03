  # Typography

Token definitions, component API, and usage rules for all text in ACKO products.

---

## Rule — Never Use Raw HTML Text Tags

Never use `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`, `<p>`, `<span>`, `<label>` for text rendering. Always use `<Typography variant="...">` from `@acko/typography`.

```tsx
// ❌ Never do this
<h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700 }}>
  Car insurance that protects you
</h1>

// ✅ Always do this
<Typography variant="display-lg" weight="bold">
  Car insurance that protects you
</Typography>
```

---

## Import

```tsx
import { Typography } from "@acko/typography";
```

---

## Props

| Prop | Type | Required | Notes |
|------|------|----------|-------|
| `variant` | `TypographyVariant` | ✅ Yes | Always required |
| `weight` | `TypographyWeight` | No | Only override when needed |
| `color` | `TypographyColor` | No | Use instead of inline color styles |
| `align` | `TypographyAlign` | No | Use instead of inline textAlign |
| `as` | `React.ElementType` | No | Override the rendered HTML tag |
| `truncate` | `boolean` | No | Single-line truncation with ellipsis |
| `className` | `string` | No | For Tailwind utility classes only |

---

## Variants — Full List

### Display (hero headings, marketing headlines)
```tsx
<Typography variant="display-xl">Largest hero heading</Typography>
<Typography variant="display-lg">Primary hero heading</Typography>
<Typography variant="display-md">Secondary hero heading</Typography>
<Typography variant="display-sm">Smaller hero heading</Typography>
```

### Heading (section titles, card titles)
```tsx
<Typography variant="heading-xl">Page section title</Typography>
<Typography variant="heading-lg">Sub-section title</Typography>
<Typography variant="heading-md">Card title</Typography>
<Typography variant="heading-sm">Small card title or step title</Typography>
```

### Body (paragraphs, descriptions)
```tsx
<Typography variant="body-lg">Lead paragraph or subtitle</Typography>
<Typography variant="body-md">Default body text</Typography>
<Typography variant="body-sm">Supporting text, descriptions</Typography>
```

### Label (form labels, UI labels)
```tsx
<Typography variant="label-lg">Large form label</Typography>
<Typography variant="label-md">Default form label</Typography>
<Typography variant="label-sm">Small form label</Typography>
```

### Utility
```tsx
<Typography variant="caption">Fine print, timestamps, metadata</Typography>
<Typography variant="overline">Eyebrow text above headings</Typography>
```

---

## Weight Values

```tsx
weight="regular"   // default body text
weight="medium"    // slightly emphasised
weight="semibold"  // section titles, card titles
weight="bold"      // hero headings, CTAs
```

---

## Color Values

The `color` prop uses 7 intent-based values, each mapping 1:1 to a `--color-text-{prop}` semantic token:

| Value | Token | Use case |
|-------|-------|----------|
| `primary` (default) | `--color-text-primary` | Headings, values, main content |
| `secondary` | `--color-text-secondary` | Subtext, captions, helpers |
| `invert` | `--color-text-invert` | Text on dark/filled surfaces |
| `brand` | `--color-text-brand` | Brand-colored text — links, emphasis |
| `error` | `--color-text-error` | Error messages |
| `success` | `--color-text-success` | Success messages |
| `static` | `--color-text-static` | Fixed white across both themes |

All tokens except `static` auto-adapt across light and dark themes.

---

## Common Patterns

### Hero section heading + subtext
```tsx
<Typography variant="display-lg" weight="bold">
  Car insurance that protects you, not just your car
</Typography>
<Typography variant="body-lg" color="secondary">
  Get comprehensive cover starting at ₹2,094/year.
</Typography>
```

### Section title + supporting text
```tsx
<Typography variant="heading-xl" weight="bold">
  Why ACKO is different
</Typography>
<Typography variant="body-lg" color="secondary">
  Built from scratch as a digital insurer.
</Typography>
```

### Card title + description
```tsx
<Typography variant="heading-md" weight="semibold">
  Instant digital policy
</Typography>
<Typography variant="body-sm" color="secondary">
  Buy in 2 minutes flat. No paperwork.
</Typography>
```

### Form label
```tsx
<Typography variant="label-md" weight="medium">
  Car Registration Number
</Typography>
```

### Eyebrow + headline
```tsx
<Typography variant="overline" color="brand">
  Trusted by 50 lakh+ car owners
</Typography>
<Typography variant="display-md" weight="bold">
  Insurance built for people who hate insurance
</Typography>
```

### Caption / fine print
```tsx
<Typography variant="caption" color="secondary">
  IRDAI Licence No. 157 · No spam. No follow-up calls.
</Typography>
```

---

## Rules

- **Never hardcode** `fontSize`, `fontWeight`, `lineHeight`, or `letterSpacing` in inline styles
- **Never use** `clamp()` for font sizing — the variant handles responsive sizing automatically
- **Never use** `color` in inline styles for text — use the `color` prop instead
- **Always pick** the closest variant to your intent — do not approximate with raw styles
- **Use `as` prop** when semantic HTML matters but visual style differs:

```tsx
// Renders as <h1> but styled as heading-md
<Typography variant="heading-md" as="h1" weight="bold">
  Page Title
</Typography>
```

---

## Rendering Rules

```css
body {
  font-family: 'Euclid Circular B', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Headings use default line wrapping — avoid global `text-wrap: balance` (awkward breaks on payment/KYC titles). */
p { text-wrap: pretty; }
```

- One `h1` per screen
- Never rely on color alone for hierarchy — size and weight first
- Never change font weight on hover (causes layout shift)

---

## Text Casing

All UI text must follow **sentence case** — capitalize only the first word and proper nouns/exceptions. Applies across: headings, buttons, labels, tabs, breadcrumbs, navigation items, links, and toast actions.

### Correct
- `Get a quote` · `View my policy` · `Continue to payment` · `Check IDV` · `Claim your NCB`

### Incorrect
- `Get A Quote` · `View My Policy` · `Continue To Payment` · `Check Idv`

### Exceptions (always retain defined casing)

**Brand names:** `ACKO` — always all-caps. Sub-brands: `ACKO Drive`, `ACKO Clinic`.

**Proper nouns:** City, state, country, and person names. `Check plans in Hyderabad` ✓ · `Check plans in hyderabad` ✗

**Regulatory & government:** `IRDAI`

**Insurance & financial acronyms:** `IDV` · `NCB` · `KYC` · `GST` · `EMI` · `OTP` · `PAN`

**All-caps emphasis:** Words like `FREE`, `NEW`, `SAVE` must remain lowercase in button/label text. All-caps belongs in the `<Badge>` component — not in text labels.

### Where casing applies

| Component | Applies? |
|-----------|----------|
| Button labels | Yes |
| Tab labels | Yes |
| Breadcrumb text | Yes |
| Navigation items | Yes |
| Link text | Yes |
| Toast action labels | Yes |
| Headings | Yes |
| Badge | No — Badge has its own `textCase` prop |

---

## Font Loading

Preload critical fonts. Use `font-display: swap`.

```html
<link rel="preload" href="/fonts/EuclidCircularB-Regular.otf" as="font" type="font/opentype" crossorigin />
```
