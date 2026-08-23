# Meridian — Style Reference

> Cool, precise clarity for money — a single indigo signal against calm neutral ground, with mono-spaced numerals that never wobble.

**Theme:** light

Meridian speaks in a calm, confident voice built for financial data: a near-white cloud canvas, generously spaced cards, and numerals that always land in a monospaced grid so amounts stay scannable and trustworthy. Headings use Space Grotesk at weight 500 — geometric and slightly technical, signaling precision without feeling cold — while IBM Plex Sans carries body copy and UI chrome. The one deliberate departure from typical fintech blue-on-white is Ledger Mono for every number that represents money: balances, deltas, transaction amounts always render in tabular figures so decimals align down a column. Color is functional, not decorative — Indigo marks the one primary action per screen, Emerald and Coral are reserved exclusively for financial direction (up/down, income/expense), and everything else stays in a five-step neutral scale. Whitespace is treated as a structural requirement, not a cosmetic nicety: card padding, grid gaps, and section gaps all carry hard minimums (see **Minimum Spacing Floors** and **Whitespace Discipline** below) that must hold even when a screen is dense with data — a crowded dashboard is a spec violation, not an acceptable tradeoff.

## Tokens — Colors

| Name     | Value     | Token              | Role                                                                                   |
| -------- | --------- | ------------------ | -------------------------------------------------------------------------------------- |
| Ink      | `#101828` | `--color-ink`      | Primary text, headings, primary icon strokes — the typographic anchor of every surface |
| Canvas   | `#ffffff` | `--color-canvas`   | Page background, modal surface, the brightest layer in the system                      |
| Cloud    | `#f7f8fa` | `--color-cloud`    | App shell background, sidebar fill — the base the page sits on                         |
| Paper    | `#eef1f5` | `--color-paper`    | Card and panel background, default resting surface for grouped content                 |
| Slate    | `#475467` | `--color-slate`    | Secondary body text, table labels, form helper copy                                    |
| Silver   | `#98a2b3` | `--color-silver`   | Placeholder text, disabled controls, muted metadata                                    |
| Hairline | `#e4e7ec` | `--color-hairline` | Dividers, table row borders, input outlines                                            |
| Indigo   | `#4f46e5` | `--color-indigo`   | The single primary accent — CTA fills, active nav state, focus rings, links            |
| Emerald  | `#12b76a` | `--color-emerald`  | Positive financial direction only — income, gains, "paid" status                       |
| Coral    | `#f04438` | `--color-coral`    | Negative financial direction only — expenses, losses, overdue alerts                   |
| Amber    | `#f79009` | `--color-amber`    | Caution state — pending transactions, approaching budget limits                        |

## Tokens — Typography

### Space Grotesk — Headings, page titles, card titles — a geometric grotesque at weight 500 reads precise and a little technical without tipping into cold · `--font-display`

- **Substitute:** Sora or Manrope at weight 500
- **Weights:** 500, 600
- **Sizes:** 14px, 16px, 24px, 32px, 48px
- **Line height:** 1.05–1.35
- **Letter spacing:** -0.01em
- **Role:** Page titles, section headers, card titles, empty-state headlines

### IBM Plex Sans — Body copy, UI labels, buttons, captions — the workhorse for every sentence a user reads · `--font-body`

- **Substitute:** Inter or Public Sans
- **Weights:** 400, 500, 600
- **Sizes:** 12px, 13px, 14px, 15px, 16px
- **Line height:** 1.2–1.5
- **Role:** Body copy, form labels, button text, table headers, navigation

### IBM Plex Mono ("Ledger Mono") — Every monetary figure, percentages, dates in tables — tabular figures keep decimal points aligned in a column · `--font-mono`

- **Substitute:** JetBrains Mono or Roboto Mono
- **Weights:** 400, 500
- **Sizes:** 13px, 14px, 16px, 20px, 36px
- **Line height:** 1.1–1.3
- **Role:** Account balances, transaction amounts, percentages, chart axis labels — never used for prose

### Type Scale

| Role       | Size | Line Height | Letter Spacing | Font          | Token               |
| ---------- | ---- | ----------- | -------------- | ------------- | ------------------- |
| caption    | 12px | 1.4         | —              | Plex Sans     | `--text-caption`    |
| body       | 14px | 1.5         | —              | Plex Sans     | `--text-body`       |
| subheading | 16px | 1.3         | —              | Space Grotesk | `--text-subheading` |
| heading    | 24px | 1.25        | -0.24px        | Space Grotesk | `--text-heading`    |
| heading-lg | 32px | 1.15        | -0.32px        | Space Grotesk | `--text-heading-lg` |
| display    | 48px | 1.05        | -0.48px        | Space Grotesk | `--text-display`    |
| figure-sm  | 14px | 1.2         | —              | Plex Mono     | `--text-figure-sm`  |
| figure-lg  | 36px | 1.1         | -0.36px        | Plex Mono     | `--text-figure-lg`  |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token        |
| ---- | ----- | ------------ |
| 4    | 4px   | `--space-4`  |
| 8    | 8px   | `--space-8`  |
| 12   | 12px  | `--space-12` |
| 16   | 16px  | `--space-16` |
| 24   | 24px  | `--space-24` |
| 32   | 32px  | `--space-32` |
| 48   | 48px  | `--space-48` |
| 64   | 64px  | `--space-64` |
| 96   | 96px  | `--space-96` |

### Minimum Spacing Floors — Non-Negotiable

These are hard floors, not defaults to shrink under pressure. If a layout feels crowded, the fix is always more whitespace, never less padding. An agent or developer implementing Meridian must treat every value below as a **minimum**, not a suggestion:

| Context                                                        | Minimum | Never Go Below | Token                  |
| -------------------------------------------------------------- | ------- | -------------- | ---------------------- |
| Card internal padding (any card, any size)                     | 24px    | 20px           | `--card-padding`       |
| Grid gap between sibling cards (desktop)                       | 24px    | 16px           | `--grid-gap`           |
| Grid gap between sibling cards (mobile, stacked)               | 16px    | 12px           | `--grid-gap-mobile`    |
| Gap between unrelated page sections (hero → grid → info block) | 48px    | 32px           | `--section-gap`        |
| Gap between a heading and the body text beneath it             | 12px    | 8px            | `--space-12`           |
| Gap between a card's icon and its title                        | 16px    | 12px           | `--space-16`           |
| Sidebar nav item vertical padding                              | 10px    | 8px            | `--nav-item-padding-y` |
| Sidebar nav item gap between items                             | 4px     | 4px            | `--nav-item-gap`       |
| Page outer margin (desktop)                                    | 32px    | 24px           | `--space-32`           |
| Page outer margin (mobile)                                     | 20px    | 16px           | `--page-margin-mobile` |

If any measurement in a shipped screen falls below the "Never Go Below" column, that screen is out of spec and must be corrected before review — this is a hard gate, not a style note.

### Border Radius

| Element       | Value |
| ------------- | ----- |
| buttons       | 8px   |
| inputs        | 10px  |
| cards         | 16px  |
| modals        | 20px  |
| tags/pills    | 999px |
| chart-tooltip | 6px   |

### Layout

- **Page max-width:** 1280px
- **Sidebar width:** 240px
- **Section gap:** 48px — the space between structurally distinct blocks (a welcome hero, a card grid, an info panel). Do not compress this to save vertical space; add a taller viewport or fewer sections instead
- **Card padding:** 24px on every side, on every card — dashboard tiles, list cards, form cards, summary cards. This value does not shrink for "compact" or "dense" card variants; Meridian has no dense mode
- **Grid gap:** 24px between sibling cards on desktop, 16px on mobile — never let cards touch or nearly touch. A visible gap is what tells the eye these are separate objects, not one merged block
- **Element gap:** 16px, used inside a single component (icon-to-label, label-to-input)
- **Density rule of thumb:** Meridian is a "comfortable" density system by definition — see Tokens above. When a screen has many elements (a dashboard grid, a long sidebar), the correct response is more breathing room around each element, not tighter packing. Cramming more into less space is a violation of the system, even if it "fits"

## Components

### Primary CTA Button

**Role:** The one high-emphasis action per screen — "Send money", "Add account", "Confirm transfer"

Indigo (#4f46e5) fill, white text, 8px radius, Plex Sans 14px weight 600, padding 10px 16px. Subtle 120ms background darken on hover, no shadow. Only one per view — Meridian never shows two indigo buttons side by side

### Secondary Button

**Role:** Lower-emphasis action beside a primary CTA

Paper (#eef1f5) fill, Ink text, 8px radius, same padding and type as primary. No border — the fill contrast against Canvas is enough separation

### Ghost Icon Button

**Role:** Compact row-level actions inside tables and lists

Transparent background, Slate icon, 8px radius, 8px square padding. On hover, background shifts to Paper — no border ever

### Balance Summary Card

**Role:** The hero number on any account or dashboard view

Canvas surface, 16px radius, 24px padding, 1px Hairline border. Label in Plex Sans 13px Slate, the balance itself in Ledger Mono 36px weight 500 Ink, with a small delta badge (Emerald or Coral) beneath showing period change

### Delta Badge

**Role:** Inline indicator of directional change (up or down)

Pill shape (999px radius), 4px vertical / 10px horizontal padding, Plex Sans 12px weight 600. Emerald text on a 10%-opacity Emerald background for gains; Coral text on 10%-opacity Coral background for losses. Always paired with a ▲/▼ glyph, never color alone

### Transaction Row

**Role:** A single line item inside a transaction list or statement

72px height, Hairline bottom border, merchant/category icon at left (32px, Paper circle background), description in Plex Sans 14px Ink, category tag beneath in Slate 12px, amount right-aligned in Ledger Mono 14px — Coral for outgoing, Ink for incoming (never Emerald for routine incoming, to keep Emerald reserved for genuine gains)

### Category Tag Pill

**Role:** Small label identifying a transaction's spending category

999px radius, 11px Plex Sans weight 500, 4px/10px padding, background is a 12%-opacity tint of that category's assigned color, text is the full-opacity version of the same color

### Budget Progress Bar

**Role:** Shows spend-to-limit ratio within a budget category

4px height track in Hairline, 4px radius fill in Indigo for normal spend, transitioning to Amber past 80% of limit and Coral past 100%. Label row above shows "Spent / Limit" in Ledger Mono 13px

### Data Table

**Role:** Dense tabular view of transactions, holdings, or statements

Canvas surface, column headers in Plex Sans 12px weight 600 uppercase Slate with 0.04em tracking, Hairline row dividers, all numeric columns right-aligned in Ledger Mono with matching decimal precision throughout a column

### Sparkline Chart Widget

**Role:** Compact trend line embedded inside a summary card

No axes, no gridlines, single Indigo stroke (2px) with a 15%-opacity Indigo fill beneath the line. Terminates in a small filled dot at the most recent value. Height stays under 48px so it reads as texture, not a full chart

### Alert Banner

**Role:** System-level warning, e.g. approaching a budget limit or a failed payment

Full-width, 12px radius, left 3px accent bar in Amber (caution) or Coral (error), 6%-opacity tint of that same color as background, icon plus Plex Sans 13px message, optional inline text-link action at right

### Account Switcher

**Role:** Dropdown in the sidebar or header for switching between linked accounts

Paper background pill (999px radius), 8px/14px padding, account name in Plex Sans 14px weight 500 Ink with a small chevron, balance shown in Ledger Mono 13px Slate beside it

### Sidebar Navigation

**Role:** Primary left-hand navigation on desktop dashboard layouts

240px fixed width, Canvas background, 24px padding on all sides (top/left/right/bottom — the sidebar is a card too, it follows the same padding floor as everything else). Each nav item is a full-width row with 10px vertical / 12px horizontal internal padding, 8px radius, and a minimum 4px gap between consecutive items — never stack nav items with 0px or 2px gaps, they must read as distinct rows, not a single list block. Active item gets a Paper background fill and Indigo text/icon; inactive items are Slate text on transparent background. The account identity block at the top (avatar, name, email) gets its own 24px padding and sits inside a Paper card, separated from the nav items below by at least 24px

### Dashboard Menu Card

**Role:** Icon + title + description tile inside a navigation grid (e.g. "Dompet & Rekening", "Kategori Transaksi")

Canvas surface, 16px radius, 24px padding on every side — this is a card, so it inherits the same non-negotiable padding floor as the Balance Summary Card. Icon sits in a 40px rounded-square tinted container, followed by a minimum 16px gap before the title (Space Grotesk 16–18px weight 500), then an 8px gap before the description (Plex Sans 13–14px Slate). Grid gap between these cards is 24px on desktop, 16px on mobile — never less

## Do's and Don'ts

### Do

- Render every monetary figure, percentage, and table date in Ledger Mono (IBM Plex Mono) with tabular figures so columns of numbers align on the decimal
- Reserve Emerald exclusively for genuine financial gains and Coral exclusively for losses/expenses — never repurpose either for generic UI state like "success" or "error" toasts unrelated to money
- Pair every color-coded direction (up/down, over/under budget) with a ▲/▼ glyph or explicit label, not color alone
- Keep exactly one Indigo primary button visible per screen — it is the single call to action, not a decorative brand color
- Right-align all numeric table columns; left-align everything else
- Use the 16px card radius as the default and reserve 999px purely for pills, tags, and the account switcher
- Let Paper (#eef1f5) do the work of separating content from Cloud/Canvas — avoid adding borders on top of a background-color change
- Apply 24px padding to every card, on every side, with no exceptions for "small" or "compact" tiles — measure it if unsure, don't eyeball it
- Leave a minimum 24px gap between sibling cards in a grid (16px on mobile) so each card visually separates from its neighbors before it separates by color or border
- Leave a minimum 48px gap between structurally different page sections (a hero block, a card grid, an info panel) — this is the single biggest lever for making a dashboard feel calm instead of crowded
- When a screen has many components, respond by increasing whitespace between them, not by shrinking padding, gaps, or type size — density and Meridian's "comfortable" spec are mutually exclusive

### Don't

- Do not use Plex Sans (or any proportional font) for a balance, amount, or percentage — proportional numerals cause columns to visually "wobble"
- Do not use Emerald or Coral as a background fill for buttons, nav states, or non-financial UI — they signal money direction only
- Do not stack a border and a shadow on the same card — Meridian cards use either a Hairline border (data-dense surfaces) or a flat color shift, never both
- Do not show more than one Indigo CTA in the same viewport — demote the rest to Secondary or Ghost
- Do not set line-height below 1.05 even on the 48px display size — financial dashboards need breathing room, unlike poster typography
- Do not use red/green alone to signal state without an icon or text label, for accessibility
- Do not round monetary figures inconsistently within the same table — decimal precision must match down the whole column
- Do not reduce card padding below 20px under any circumstance, including "to fit more content" or "to match a reference screenshot" — reflow the layout (fewer columns, more scroll) instead of compressing padding
- Do not let sidebar nav items or stacked mobile cards sit closer than the stated minimum gap — if items look like one merged block instead of a list of distinct rows, the gap is wrong
- Do not treat whitespace as the thing to cut when a screen "doesn't fit" — cut content, reduce columns, or paginate before you cut padding or gaps
- Do not name custom spacing tokens `--spacing-{number}` in a Tailwind v4 project — that exact namespace is reserved by Tailwind to auto-generate numbered utilities (`w-4`, `h-4`, `p-4`, `gap-4`, `size-4`, etc.) via a 0.25rem multiplier. Defining `--spacing-4: 4px` silently overrides Tailwind's own `w-4`/`h-4` (16px) with 4px, shrinking every icon and element that uses those classes elsewhere in the app. Use `--space-*` (this doc's convention) or another non-colliding prefix instead

## Surfaces

| Level | Name           | Value     | Purpose                                                         |
| ----- | -------------- | --------- | --------------------------------------------------------------- |
| 0     | Cloud Base     | `#f7f8fa` | App shell / body background — the base the whole layout sits on |
| 1     | Canvas Surface | `#ffffff` | Cards, modals, tables — the primary content surface             |
| 2     | Paper Surface  | `#eef1f5` | Nested panels, sidebar, hover states, tag backgrounds           |
| —     | Hairline       | `#e4e7ec` | Dividers, input borders, table row separators                   |

## Agent Prompt Guide

Quick Color Reference:

- text: #101828 (Ink)
- background: #f7f8fa (Cloud)
- surface/card: #ffffff (Canvas)
- nested surface: #eef1f5 (Paper)
- border/divider: #e4e7ec (Hairline)
- primary action: #4f46e5 (Indigo)
- positive/gain: #12b76a (Emerald)
- negative/expense: #f04438 (Coral)
- caution/pending: #f79009 (Amber)

Example Component Prompts:

1. Dashboard Header: Cloud (#f7f8fa) background. Page title "Overview" at 32px Space Grotesk weight 500, #101828. Primary button "Add account" — Indigo (#4f46e5) fill, white text, 8px radius, Plex Sans 14px weight 600, padding 10px 16px — anchored top right.

2. Balance Summary Card: Canvas (#ffffff) surface, 16px radius, 1px Hairline (#e4e7ec) border, 24px padding. Label "Total balance" in Plex Sans 13px #475467. Balance "$48,204.12" in Plex Mono 36px weight 500 #101828. Delta badge below: "▲ 4.2% this month" — Emerald text on 10%-opacity Emerald pill.

3. Transaction List: Canvas background. Each row 72px tall with Hairline bottom border. Left: 32px Paper circle icon, merchant name in Plex Sans 14px #101828, category tag pill beneath in Slate. Right: amount in Plex Mono 14px, Coral for outgoing, Ink for incoming.

4. Budget Progress Card: Canvas surface, 16px radius, 24px padding. Category name "Groceries" in Plex Sans 14px weight 500. "$340 / $400" in Plex Mono 13px right-aligned. 4px progress track in Hairline, Amber fill at 85% spent.

5. Account Switcher: Paper (#eef1f5) pill, 999px radius, 8px/14px padding. Account name "Checking ••4821" in Plex Sans 14px weight 500 #101828, balance "$12,040.55" in Plex Mono 13px #475467 to the right, chevron icon at far right.

## Typography Philosophy

Space Grotesk is the headline voice; Plex Sans is the reading voice; Plex Mono is the counting voice. Splitting typography three ways — rather than the usual two-font display/body pairing — exists because financial interfaces have a job most interfaces don't: numbers must be instantly comparable down a column. Proportional fonts render "1" narrower than "8", so a list of amounts in Plex Sans drifts out of alignment the moment digits change. Ledger Mono fixes that structurally, not visually — every digit occupies identical width, so a user's eye can scan a column of balances without re-reading each one. Space Grotesk at 500 (never lighter, never bolder) gives headings a geometric, faintly technical character that signals "this system is precise" without borrowing the coldness of pure monospace everywhere.

## Numeral Alignment System

The defining structural choice in Meridian is that money is typographically distinct from prose. Any string that represents currency, a percentage, or a date in a table renders in Ledger Mono — full stop, no exceptions, even inside otherwise Plex Sans components like a card label. This creates an instantly learnable visual grammar: if it's monospaced, it's countable; if it's proportional, it's descriptive. Combine that with strict right-alignment on numeric table columns and matched decimal precision within a column, and users can scan a full statement without consciously reading — the shape of the numbers alone communicates magnitude and direction.

## Whitespace Discipline

Financial dashboards fail most often not because of bad color or bad type, but because they get treated as data-dumping grounds — every card padding shaved down, every gap tightened, so "more fits." Meridian explicitly rejects that instinct. Whitespace here is not empty space to be optimized away; it's what lets a user tell, at a glance, which numbers belong together and which don't. A card with 24px of air around its content reads as one discrete, trustworthy unit of information. The same card with 12px of padding starts to visually bleed into its neighbors, and the user has to work — consciously grouping content the layout should have grouped for them.

This means whitespace in Meridian is load-bearing, not decorative, and it follows a strict hierarchy:

1. **Section gap (48px)** separates things that are conceptually unrelated — a welcome header versus a navigation grid versus a system-status footnote. If two blocks don't answer the same question, they get a full section gap.
2. **Grid gap (24px desktop / 16px mobile)** separates things that are related but independent — sibling cards in the same menu, sibling transactions in the same list. They belong to the same group, but each is its own unit.
3. **Card padding (24px)** separates a card's content from the world outside it. This is the minimum breathing room any piece of content gets before it touches an edge, and it never drops below 20px even under real space constraints.
4. **Element gap (16px) and inner spacing (8–12px)** governs relationships _inside_ one component — icon to label, heading to body text. This is the only tier allowed to compress on mobile, and only down to the stated floors.

When implementing a screen, resolve spacing top-down through this hierarchy rather than guessing per-pixel: decide what's a section, what's a grid, what's a card, and let the tier — not the available space — set the gap.

### Responsive Behavior

- On mobile, **stacked cards keep their full 24px padding** — padding is the last thing to compress, not the first. What changes on mobile is layout (grid → single column) and section gap (48px → 32px minimum), not card padding.
- Sidebar collapses to a top bar or drawer on mobile, but nav items retain their 10px vertical padding and 4px inter-item gap — a cramped nav list is just as much a violation on mobile as on desktop.
- If content genuinely cannot fit within these floors at a given viewport, the correct fix is to reduce the number of visible items (pagination, "show more," collapsing a section) — never to silently shrink the spacing tokens.

## Similar Brands

- **Mercury** — Shared restraint around a single indigo/blue accent against near-white surfaces, and heavy reliance on monospaced figures for account balances
- **Ramp** — Comparable use of a tight neutral palette with color reserved strictly for financial signal (spend up/down), not brand decoration
- **Wise** — Similar directness in transaction lists — icon, description, right-aligned amount — with no unnecessary ornamentation
- **Linear** — Shared taste for flat color-shift surfaces over shadows, and a geometric display typeface used at a single restrained weight

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-ink: #101828;
  --color-canvas: #ffffff;
  --color-cloud: #f7f8fa;
  --color-paper: #eef1f5;
  --color-slate: #475467;
  --color-silver: #98a2b3;
  --color-hairline: #e4e7ec;
  --color-indigo: #4f46e5;
  --color-emerald: #12b76a;
  --color-coral: #f04438;
  --color-amber: #f79009;

  /* Typography — Font Families */
  --font-display:
    "Space Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, sans-serif;
  --font-body:
    "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, sans-serif;
  --font-mono:
    "IBM Plex Mono", ui-monospace, "SFMono-Regular", "JetBrains Mono", Menlo,
    monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.4;
  --text-body: 14px;
  --leading-body: 1.5;
  --text-subheading: 16px;
  --leading-subheading: 1.3;
  --text-heading: 24px;
  --leading-heading: 1.25;
  --tracking-heading: -0.24px;
  --text-heading-lg: 32px;
  --leading-heading-lg: 1.15;
  --tracking-heading-lg: -0.32px;
  --text-display: 48px;
  --leading-display: 1.05;
  --tracking-display: -0.48px;
  --text-figure-sm: 14px;
  --text-figure-lg: 36px;
  --tracking-figure-lg: -0.36px;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing — uses --space-* (not --spacing-*) so it never collides with
     Tailwind v4's reserved --spacing-{n} namespace, which auto-generates
     numbered utilities like w-4, h-4, p-4, gap-4 via a 0.25rem multiplier.
     Defining --spacing-4 directly would override Tailwind's own w-4/h-4/p-4
     (16px) with a literal 4px, shrinking every icon and element using them. */
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;
  --space-96: 96px;

  /* Layout */
  --page-max-width: 1280px;
  --sidebar-width: 240px;
  --section-gap: 48px;
  --section-gap-mobile: 32px;
  --card-padding: 24px;
  --card-padding-min: 20px;
  --element-gap: 16px;
  --grid-gap: 24px;
  --grid-gap-mobile: 16px;
  --nav-item-padding-y: 10px;
  --nav-item-padding-x: 12px;
  --nav-item-gap: 4px;
  --page-margin-desktop: 32px;
  --page-margin-mobile: 20px;

  /* Border Radius */
  --radius-buttons: 8px;
  --radius-inputs: 10px;
  --radius-cards: 16px;
  --radius-modals: 20px;
  --radius-pills: 999px;
  --radius-tooltip: 6px;

  /* Surfaces */
  --surface-cloud-base: #f7f8fa;
  --surface-canvas: #ffffff;
  --surface-paper: #eef1f5;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-ink: #101828;
  --color-canvas: #ffffff;
  --color-cloud: #f7f8fa;
  --color-paper: #eef1f5;
  --color-slate: #475467;
  --color-silver: #98a2b3;
  --color-hairline: #e4e7ec;
  --color-indigo: #4f46e5;
  --color-emerald: #12b76a;
  --color-coral: #f04438;
  --color-amber: #f79009;

  /* Typography */
  --font-display:
    "Space Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, sans-serif;
  --font-body:
    "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, sans-serif;
  --font-mono:
    "IBM Plex Mono", ui-monospace, "SFMono-Regular", "JetBrains Mono", Menlo,
    monospace;

  /* Typography — Scale */
  --text-caption: 12px;
  --leading-caption: 1.4;
  --text-body: 14px;
  --leading-body: 1.5;
  --text-subheading: 16px;
  --leading-subheading: 1.3;
  --text-heading: 24px;
  --leading-heading: 1.25;
  --tracking-heading: -0.24px;
  --text-heading-lg: 32px;
  --leading-heading-lg: 1.15;
  --tracking-heading-lg: -0.32px;
  --text-display: 48px;
  --leading-display: 1.05;
  --tracking-display: -0.48px;

  /* Spacing — --space-* (not --spacing-*), see note above under Quick Start */
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;
  --space-96: 96px;

  /* Layout spacing floors */
  --section-gap: 48px;
  --section-gap-mobile: 32px;
  --card-padding: 24px;
  --card-padding-min: 20px;
  --grid-gap: 24px;
  --grid-gap-mobile: 16px;
  --nav-item-padding-y: 10px;
  --nav-item-padding-x: 12px;
  --nav-item-gap: 4px;

  /* Border Radius */
  --radius-buttons: 8px;
  --radius-inputs: 10px;
  --radius-cards: 16px;
  --radius-modals: 20px;
  --radius-pills: 999px;
}
```
