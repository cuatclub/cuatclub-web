# DESIGN.md — cuatclub Design System

This documents the *actual* design system in the codebase today, derived from
`src/styles/globals.css` and `src/components/ui/*`. It's descriptive, not aspirational — if a
rule below doesn't match a component, the component is either the source of truth or a bug to
flag, not this doc. A rendered, visual version of this file lives at `docs/DESIGN.html`.

Light mode only — there is no dark theme in `globals.css` yet.

## 1. Stack

- **Tailwind v4**, configured entirely in CSS via `@theme` in `src/styles/globals.css` (no
  `tailwind.config.*` file).
- **shadcn/ui** conventions (`components.json`): `new-york` style, `neutral` base color, CSS
  variables on, no prefix. Components are hand-written under `src/components/ui/`, not the
  shadcn CLI defaults — they've been reshaped to this app's tokens.
- **class-variance-authority (cva)** for components with a small, closed set of visual variants
  (`Button`, `Tag`).
- **Radix UI primitives** underlie the interactive components (`Checkbox`, `Dialog`, `Select`,
  the dropdown menu behind `MultiSelect`) — this app's components are a styled wrapper layer,
  not a replacement.
- **lucide-react** exclusively for icons.
- **tw-animate-css** supplies the `animate-in`/`animate-out`/`fade-in-0`/`zoom-in-95`/etc.
  utility classes used for enter/exit transitions (dialogs, dropdowns, the mobile nav drawer).
- **`cn()`** (`src/lib/utils.ts`, `clsx` + `tailwind-merge`) is the only way class names are
  composed — never string-concatenate classes.

## 2. Tokens (`src/styles/globals.css`)

All color tokens are CSS variables on `:root`, re-exposed as Tailwind utilities via `@theme
inline` (so `bg-primary`, `text-foreground-muted`, `border-border`, etc. are all valid classes).

### Fonts

| Variable | Family | Used via |
|---|---|---|
| `--font-th-sarabun` | Sarabun (Thai subset) | loaded in `layout.tsx`, not currently applied to any component — reserved |
| `--font-ibm-plex` | IBM Plex Sans Thai | `font-ibm-plex` — the font every component actually uses |

Every piece of UI text in the component library is `font-ibm-plex`. Treat that as the default
body/UI typeface; don't reach for `font-th-sarabun` without a reason, since nothing currently
establishes what it's for.

### Colors

| Token | Value | Role |
|---|---|---|
| `--primary` | `#dd598c` | Brand pink — primary actions, active/selected states, links |
| `--primary-light` | `#eeacc5` | Hover borders, disabled-primary fills |
| `--primary-lighter` | `#f8dee8` | Subtle tinted backgrounds (selected-tag fill, hover fill on outline buttons/tags) |
| `--foreground` | `#0a0a0a` | Primary text |
| `--foreground-secondary` | `#595959` | Secondary text (e.g. checkbox border tint at 30% alpha) |
| `--foreground-muted` | `#707070` | Muted/supporting text (descriptions, affiliations) |
| `--placeholder` | `#acacac` | Placeholder text, disabled text, inactive icons |
| `--border` | `#ececec` | Default border color; also the disabled-field background |
| `--surface` | `#f0f0f0` | Flat surface fill (defined, lightly used) |
| `--success` | `#00c951` | Success state |
| `--error` | `#dc2626` | Error state — error text, error borders |

### Tag palette

Nine hues, each with a solid and a `-light` background pair, used for category tags:
`purple`, `pink`, `red`, `orange`, `yellow`, `lime`, `green`, `cyan`, `blue`, `slate`. These are
plumbed through as data (e.g. a category's `fontColor`/`backgroundColor` from the API) into
`Tag`'s `color`/`bgColor` props rather than picked by Tailwind class per-tag — see §4.

### Shadow

`shadow-black` — `0px 0px 30px 0px rgba(0,0,0,0.1)`, a soft, wide, low-opacity shadow. This is
the *only* shadow in the system — used for elevated surfaces (`Card`, `Dialog` panel, `Select`
content, `MultiSelect` content). It reads as a diffuse ambient lift, not a directional
drop-shadow — don't introduce `shadow-md`/`shadow-lg` etc. alongside it.

### Radius

No custom radius tokens — plain Tailwind scale, but used with a consistent hierarchy:

- `rounded-full` — avatars, tag pills
- `rounded-lg` (8px) — interactive controls: buttons, inputs, selects, dropdown/select panels, pagination cells
- `rounded-xl` (12px) — containers: `Card`, `Dialog` panel (desktop), club cards
- `rounded-[2px]` — checkbox box (deliberately near-square, not part of the lg/xl hierarchy)

## 3. Typography scale

The dominant pattern across nearly every component is a **two-step responsive scale**: a smaller
size/line-height below `md`, a larger one from `md` up. This pair recurs verbatim enough that it
should be treated as the default text scale for new UI text, not one-off tuning:

| Role | Mobile | ≥ md |
|---|---|---|
| Body / control text (buttons, inputs, selects, labels) | `text-sm leading-[23px]` | `text-base leading-[26px]` |
| Small/help text (tag labels, pagination ellipsis) | `text-xs leading-[20px]` | `text-sm leading-[23px]` |
| Card/section title | `text-lg leading-[30px] font-semibold` | `text-xl leading-[33px]` |
| Error/helper text | `text-xs leading-[23px]` | `text-sm` |

Font weight: `font-medium` for labels/interactive text, `font-semibold` for titles/emphasis,
plain (400) for body copy.

## 4. Color usage patterns

- **Interactive primary color** (`primary`/`primary-light`/`primary-lighter`) drives all
  hover/focus/selected states across controls — border darkens to `primary` on focus, lightens
  to `primary-light` on hover, backgrounds tint to `primary-lighter` for hover fills and
  highlighted list items.
- **Disabled state** is consistently `bg-border` (fields) or `-light` variant of the base color
  (buttons/tags), paired with `text-placeholder`, and `cursor-not-allowed`.
- **Error state** replaces the border/text color with `error` everywhere it applies (hover and
  focus included), rather than only marking the field on blur — see `Input`, `Textarea`,
  `Select`, `MultiSelect`.
- **Runtime colors**: `Tag` is the one component designed to take colors as *data* rather than
  variant props — `color`/`bgColor` are passed as raw CSS strings and applied via inline
  `style`, defaulting to `primary`/`primary-lighter`. This is intentional (category colors come
  from the backend), not a shortcut — don't refactor it into Tailwind classes without checking
  callers still work with arbitrary hex values.

## 5. Base components (`src/components/ui/`)

Every form-style component (`Input`, `Textarea`, `PasswordInput`, `Select`, `MultiSelect`)
shares one shape — copy it exactly when adding a new one:

- `forwardRef`, optional `label`, `error: boolean`, `errorMessage?: string`, `wrapperClassName`
  for the outer `flex flex-col gap-1` wrapper vs. `className` for the control itself.
- IDs wired by hand with `useId()`: `inputId`, `errorId`, merged into `aria-describedby` along
  with any caller-supplied `aria-describedby`.
- Border-color-only state changes: `border-border` default → `hover:border-primary-light` →
  `focus:border-primary`, swapped wholesale to `error`/`hover:border-error`/`focus:border-error`
  when `error` is true. No focus ring on these — border color *is* the focus indicator.

| Component | Notes |
|---|---|
| `Button` | `cva`, two variants: `primary` (filled) / `outline` (bordered, transparent bg). Fixed `h-[40px]`. `isLoading` swaps children for a spinner + visually-hidden label, doesn't just disable. |
| `Input` / `Textarea` / `PasswordInput` | Same label/error contract (above). `PasswordInput` adds a visibility toggle button positioned absolutely inside the field, Thai `aria-label`s for both states. |
| `Select` / `MultiSelect` | Both wrap Radix (`react-select` / `react-dropdown-menu`) behind the same string-array `options` API. `Select` is single-value; `MultiSelect` renders hidden `<input type="hidden">` per selected value when `name` is given (so it participates in a plain form submit), shows "เลือกแล้ว N" instead of listing selections. |
| `Checkbox` | Radix checkbox; `label` is optional — renders bare if omitted so it can be composed into custom rows. |
| `Tag` | `cva` variants `solid`/`outline`, plus a third *mode* via the `type` prop: `type="solid"` (default, static) vs `type="selectable"` (button, toggles outline↔solid, shows an `×` when selected). This is a discriminated union (`SolidTagProps` vs `SelectableTagProps`) — don't add boolean flags to fake the discrimination. |
| `Card` | Composable slot set (`CardHeader`/`CardTitle`/`CardDescription`/`CardAction`/`CardContent`/`CardFooter`), shadcn-style. This is the **elevated** surface idiom: `bg-white shadow-black rounded-xl`, no border. |
| `Dialog` | Wraps Radix Dialog. Always a right-hand drawer below `md`. Above `md`, `placement="centered"` (default, portalled, floats mid-screen) or `placement="anchored"` (drops out of its positioned ancestor, sits 6px below it — pair with `modal={false}` on the root since it has no scrim). |
| `Pagination` | Not a thin wrapper — owns real logic (`getPaginationRange`) for collapsing long page runs to `1 … 4 5 6 … 20`. Only component using a visible `focus-visible:ring-2` — everything else signals focus via border/background color instead. |

## 6. Two card idioms — don't conflate them

- **Elevated** (`Card` component): white surface, no border, `shadow-black`. For content that
  floats over the page (menus, popovers by extension).
- **Bordered/interactive** (hand-rolled, e.g. `ClubCard`): `border border-border rounded-xl`,
  *no* shadow, `hover:border-primary-light` as the only hover affordance, sits directly in the
  page background. For grid/list items that are themselves links, so the whole surface needs a
  clear but subtle hover state without implying it's "raised" over other cards. When building a
  new clickable card in a list, follow `ClubCard`'s pattern, not `Card`'s.

## 7. Interaction & accessibility conventions

- Whole-surface links (`ClubCard`) get `focus-visible:ring-2 focus-visible:ring-primary
  focus-visible:ring-offset-2 focus-visible:outline-none` — this is the one place a visible
  focus ring is used instead of a border-color swap, because the "border" here is decorative
  spacing, not a form-field affordance.
- Every icon-only button has a Thai `aria-label` (`เปิดเมนู`, `ปิดเมนู`, `ก่อนหน้า`, `ถัดไป`,
  `แสดงรหัสผ่าน`/`ซ่อนรหัสผ่าน`). All static microcopy is Thai — this is a Thai-first product,
  not an i18n-ready one (no locale abstraction exists).
- `Navbar`'s mobile drawer hand-rolls a focus trap (`FOCUSABLE_SELECTOR` query + `Tab`/`Shift+Tab`
  wraparound + `Escape` to close + focus restoration to the toggle button on close) since it's a
  plain `fixed` overlay, not a Radix `Dialog`. If a future mobile menu needs this again, prefer
  reusing `Dialog` over re-deriving this logic.
- Disabled affordance is always three-part: color change + `cursor-not-allowed` +
  `pointer-events-none`/`disabled` attribute — never just one of the three.

## 8. When adding a new component

1. Check whether an existing component already covers the shape (form field vs. static display
   vs. overlay) and copy its prop contract (`label`/`error`/`errorMessage`/`wrapperClassName`) —
   consistency here matters more than component-specific optimization.
2. Use the two-step responsive text scale from §3 unless there's a specific reason not to.
3. Reach for `primary`/`primary-light`/`primary-lighter` for interactive state, `border-border`
   for static structure, and only add a new CSS variable to `globals.css` if the shade doesn't
   already exist as one of these — the tag palette especially should not be extended informally.
4. `rounded-lg` for anything you interact with directly, `rounded-xl` for containers, `rounded-full`
   for pills/avatars.
5. New icons: `lucide-react` only, per `AGENTS.md`.
