# Homepage redesign - pastel editorial with trust UX

**Date:** 2026-04-27
**Status:** Approved
**Scope:** Full site (home, services, projects, articles, bookmarks) - structural and content rework
**Stack:** Nuxt 3, @nuxt/ui, Tailwind, @nuxt/content, RTL Arabic-first

## Goal

Transform sufyanfa.com from a narrow blog/portfolio layout into a wider, modular landing page that converts visitors into booked consultations. The site must communicate **trust, confidence, and clarity** within seconds. The visitor is a founder evaluating Sufyan as a technical partner - not a designer browsing a portfolio.

## Inspiration

- **Raseel Corporate** (corporate.raseel.gift) - modular landing rhythm: hero → services grid → stats → process → projects → testimonials → blog → footer.
- **ilham.io showcase (Ghonimi card)** - pastel surface, centered hero, big bold Arabic display type, floating skill pills around a circular avatar, hand-drawn underline accents, stats grid.

We borrow the rhythm from raseel and the visual language from ilham.io. We do not copy either.

## Design principles

1. **Trust over decoration** - every section earns its place by reducing risk or adding proof. No section is purely decorative.
2. **One signature look** - pastel sage + lavender, two colors plus neutrals. No multi-color rainbows.
3. **Centered, type-led** - Arabic display headlines are the visual hero, not imagery.
4. **Clarity over cleverness** - concrete deliverables, real timing, named testimonials. No vague aspirational copy.
5. **Risk-free conversion** - every CTA is paired with microcopy that reduces commitment fear (no commitment / 24h reply / confidential).

## Visual system

### Color palette

Two accent colors plus neutrals.

| Token | Hex | Usage |
|---|---|---|
| `sage` | `#DCEEE7` | primary surface tint - hero bg, section bands, alternating cards |
| `sage-deep` | `#C9E4DA` | subtle borders within sage areas |
| `lavender` | `#E8DFFF` | secondary surface tint - alternating cards, testimonial band |
| `lavender-ink` | `#5B4F8A` | label/eyebrow text on lavender, hand-drawn accents |
| `ink` | `#0A0A0A` | body text, headlines, CTAs |
| `ink-soft` | `#3F3F46` | secondary text |
| `ink-mute` | `#737373` | tertiary / metadata |
| `bg` | `#FFFFFF` | base page surface |
| `bg-soft` | `#FAFAF9` | subtle alternating section |
| `success` | `#16A34A` | trust ticks, availability dot |

Drop the existing `primary: 'blue'` from `app.config.ts`. Replace with sage/lavender tokens defined in Tailwind config.

### Typography

Keep current Rubik (Arabic) + Inter (Latin) loaded via `@nuxtjs/google-fonts`. Adjust scale:

| Style | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Display (hero) | 60px | 800 | 1.15 | -0.035em |
| H2 (section) | 38–40px | 800 | 1.2 | -0.025em |
| H3 (card) | 18–22px | 700 | 1.3 | -0.01em |
| Body | 14–18px | 400 | 1.7 | normal |
| Eyebrow | 11–12px | 600 | normal | 0.1–0.14em (uppercase Latin or unspaced Arabic) |

Mobile scales down - display 36–40px, H2 28px.

### Spacing rhythm

- Section vertical padding: `96px` desktop / `64px` mobile (top and bottom).
- Section horizontal padding: `64px` desktop / `24px` mobile.
- Card padding: `28–32px`.
- Container max width: `1080px` (replaces current `max-w-2xl` constraint).

### Surface treatments

- **Cards**: `border-radius: 18–24px`, no shadow by default, optional `box-shadow: 0 8px 24px rgba(91,79,138,0.08)` for the "most-popular" card only.
- **Pills**: `border-radius: 999px`, padding `9–10px 18px` for skill pills, `7px 16px` for status badges.
- **Buttons**: black pill (`#0A0A0A` bg, white text) is the standard CTA. Padding `14px 32px`. No gradients.

### Decorative accents (used sparingly)

- Hand-drawn SVG underline beneath the headline accent word.
- One sage→lavender radial halo behind the hero photo.
- 2–3 small SVG sparkle/squiggle accents in the hero only - never in cards.
- Optional pastel circles as backgrounds for sections - only on hero, testimonial, and final CTA.

## Page structure

### Home (`pages/index.vue`)

Section order top to bottom:

1. **Top nav** - text-based: Logo · Services · Projects · Articles · [black pill CTA: احجز جلسة مجانية]
2. **Hero** - sage bg, decorative accents
   - Status badge: live availability ("متاح لمشروع جديد هذا الشهر")
   - Centered photo (200px circle) with sage→lavender halo, white border, "+8 سنوات" credential chip on top-right corner
   - 3 floating skill pills around the photo (lavender bg)
   - "+12 منتج تم إطلاقه" trust chip docked below
   - Display headline with hand-drawn underline on accent word
   - Subtitle paragraph
   - Black pill CTA + 3 trust ticks (no commitment / 24h reply / confidential)
3. **Trusted by** - white band with project name wordmarks (نُمو, عُقاب, عزّام, تواصل, أرعام, checker)
4. **Stats** - `bg-soft` band, 4 numbers (+12 products, +8 years, +30 founders, 24h response time)
5. **Is this for you?** - 3 personas in alternating sage/lavender cards (founder with idea / founder with early product / founder with team)
6. **Services** - 3 cards on `bg-soft`, each with: ordered tag (٠١/٠٢/٠٣), title, one-line desc, "ما ستحصل عليه" deliverables list with green ticks, timing footer + "احجز" link. Middle card flagged "الأكثر طلبًا" with subtle shadow.
7. **How I work** - sage band, 3 cards with timing eyebrow ("الخطوة ١ · ٣٠ دقيقة"), title, description.
8. **Featured projects** - 2 cards, alternating sage/lavender. Each shows role + year, live status dot, name, 1-2 sentence outcome (not just description), "عرض الحالة" link. Plus "كل المشاريع" link below.
9. **Testimonials** - lavender band, 2 quote cards on white. Each has quote, avatar, name, role+context.
10. **FAQ** - white section, 4 collapsed Q&A items addressing cost / scope / timeline / fit. First one expanded by default.
11. **Featured articles** - `bg-soft` band, 3 cards with date + read-time, title, description.
12. **Final CTA** - sage band, big "جاهز نتحدث؟" headline, risk-reducer paragraph, black pill CTA, repeat 3 trust ticks.
13. **Footer** - white, simple: name + © + location + response time | social links.

### Services page (`pages/services/index.vue`)

Reuse the home services card design but show all services. Each service detail page (`pages/services/[url].vue`) becomes a long-form page with hero, deliverables, FAQ, and final CTA.

### Projects page (`pages/projects.vue`)

Grid of 2-column project cards using the alternating sage/lavender pattern. Each card has the case-study fields (role, year, status, name, outcome).

### Articles index + slug

Keep current long-form article reading layout. Apply: new color tokens, eyebrow style, larger article cards on the index, removed icons.

### Bookmarks page

Lightest touch: just adopt new typography and color tokens. No structural change.

## Components

### New components

| Path | Purpose |
|---|---|
| `components/Home/Hero.vue` | New centered hero with photo, halo, pills, decorative SVGs |
| `components/Home/TrustedBy.vue` | Wordmark strip |
| `components/Home/Stats.vue` | 4-number band |
| `components/Home/Personas.vue` | "Is this for you?" 3 cards |
| `components/Home/HowIWork.vue` | 3-step process band |
| `components/Home/Testimonials.vue` | 2-card testimonial section |
| `components/Home/FAQ.vue` | Collapsible Q&A list |
| `components/Home/FinalCTA.vue` | Closing CTA band |
| `components/App/StatusBadge.vue` | Reusable availability pill (green dot + text) |
| `components/App/TrustTicks.vue` | Reusable 3-tick row |
| `components/App/PillButton.vue` | Black pill CTA wrapper |
| `components/App/Eyebrow.vue` | Section label pill |

### Components to update

| Path | Changes |
|---|---|
| `components/App/Navbar.vue` | Replace icon-only floating nav with text nav + black pill CTA on the right |
| `components/App/Footer.vue` | Add real footer with location + response time + social row |
| `components/App/ServiceCard.vue` | New card with deliverables list, ordered tag, timing footer |
| `components/App/ProjectCard.vue` | New case-study card with role + year + live status |
| `components/App/ArticleCard.vue` | Add read-time, refresh date format, drop the vertical line accent |
| `components/Home/FeaturedServices.vue` | Use new ServiceCard, 3-card grid layout |
| `components/Home/FeaturedProjects.vue` | Use new ProjectCard, 2-card grid layout |
| `components/Home/FeaturedArticles.vue` | 3-card grid |
| `components/Home/Newsletter.vue` | Drop. The existing `gohodhod.com` iframe contradicts the calm direction and isn't a trust signal at this stage. |
| `components/Home/SocialLinks.vue` | Drop - moved into footer |
| `components/Home/CTAButtons.vue` | Drop - replaced by Hero CTA + Final CTA |
| `components/Home/Intro.vue` | Drop - replaced by Hero |
| `components/Home/ProductAlert.vue` | Drop - floating banner contradicts the calm design |

### Content updates

Existing JSON content gets richer fields:

`content/services/*.json`:
```json
{
  "name": "string",
  "tagline": "one-line description",
  "url": "/services/<slug>",
  "order": "01|02|03",
  "deliverables": ["string", "string", "string"],
  "timing": "string (e.g., '90 دقيقة' or '2-4 أسبوع')",
  "popular": false
}
```

`content/projects/*.json`:
```json
{
  "name": "string",
  "url": "string",
  "role": "string (مؤسس / شريك تقني / مطور)",
  "year": "string",
  "status": "live | wip | archived",
  "outcome": "1-2 sentence outcome (not just feature description)",
  "thumbnail": "string"
}
```

New content files needed:

- `content/testimonials/*.json` - quote, name, role, context
- `content/faqs/*.json` - question, answer
- `content/personas/*.json` - order, title, description (the 3 "is this for you?" personas)
- `content/stats.json` - 4 numbers + labels (single file)

## Content rewrite (tone)

Current Arabic copy tilts formal/professional ("متخصص في بناء المنتجات الرقمية"). New tone is direct, founder-to-founder, plain Arabic - no corporate jargon. Examples:

| Old | New |
|---|---|
| "شريكك التقني لتحويل فكرتك إلى منتج رقمي حقيقي" | "من فكرة على ورقة، إلى منتج يستخدمه الناس." |
| "أرافق رواد الأعمال من التخطيط وحتى التشغيل التجاري؛ لسد الفجوة بين التقنية ونموذج العمل..." | "نخرج معًا بخطة واضحة لمنتجك خلال ٣٠ دقيقة، ونبنيه بميزانية ووقت واقعيَّيْن." |
| "احصل على استشارة مجانية" | "احجز جلسة مجانية ٣٠ دقيقة" |

Apply this rewrite to: home, services index, each service detail, projects index, project descriptions, footer.

## Trust UX patterns (mandatory)

These must appear and remain consistent across rewrites:

1. **Live availability** - green dot + specific month/timeframe in hero status badge.
2. **3 trust ticks** under primary CTAs - paired with every major CTA: hero, services index, final CTA. Same three: بدون التزام / رد خلال ٢٤ ساعة / سرّية كاملة.
3. **Concrete deliverables** - every service lists ✓ items, never vague benefits.
4. **Timing** - every service and process step states duration.
5. **Named testimonials** - first name + role + context (شركة ناشئة في الرياض). Avoid full anonymity.
6. **Live project status** - projects show حيّ / WIP visually.
7. **Footer response time** - يرد خلال ٢٤ ساعة as a footer line.

## Responsive behavior (mandatory)

The site must work cleanly at three breakpoints. Tailwind's default `sm` (640px), `md` (768px), and `lg` (1024px) prefixes apply. Test at 375px, 768px, and 1280px minimum.

### Breakpoints

| | Mobile (<640px) | Tablet (640–1024px) | Desktop (≥1024px) |
|---|---|---|---|
| Container | full width, 24px side padding | 32px side padding, max 720px | max 1080px, 64px side padding |
| Section padding (vertical) | 64px | 80px | 96px |
| Hero display size | 36–40px | 48px | 60px |
| Hero photo | 140px circle | 170px | 200px |
| H2 size | 28px | 32px | 38–40px |
| Body | 15px | 16px | 17–18px |

### Layout reflow per section

| Section | Mobile | Tablet | Desktop |
|---|---|---|---|
| Top nav | Logo + hamburger menu (drawer) | Logo + visible links + CTA pill | Logo + visible links + CTA pill |
| Hero pills around photo | Stack below photo, centered, wrap | 2-column grid below photo | Float around photo (4 pills, top/bottom positions) |
| Trusted-by strip | Horizontal scroll if overflow | Wrap, centered | Single row, centered |
| Stats (4 numbers) | 2×2 grid | 4×1 row | 4×1 row |
| Personas (3 cards) | 1 column stack | 1 column stack | 3 column row |
| Services (3 cards) | 1 column stack | 1 column stack | 3 column row, middle card retains "popular" lift |
| How I work (3 cards) | 1 column stack | 1 column stack | 3 column row |
| Featured projects (4 cards) | 1 column stack | 2 column grid | 2 column grid |
| Testimonials (2 cards) | 1 column stack | 1 column stack | 2 column row |
| FAQ | full width | full width | max 760px centered |
| Articles (3 cards) | 1 column stack | 2 column grid (last full-width) | 3 column row |
| Final CTA | center stack, headline 32px | center stack, headline 40px | center stack, headline 48px |
| Footer | stack: logo block, then social links | row | row |

### Touch targets

All buttons and pills hit ≥44×44px on touch. CTA pills: minimum padding `12px 24px` on mobile (slightly tighter than desktop's 14×32 - keeps the touch area generous without going huge).

### Decorative accents on mobile

- Hero halo behind photo: scale to 70% of desktop, keep visible.
- Sparkles + squiggles: hide on mobile (<640px) - they crowd the layout. Keep on tablet+.
- Hand-drawn underline under accent word: keep at all breakpoints.

### Tested at

`375px` (iPhone SE / 12 mini), `390px` (iPhone 14), `768px` (iPad portrait), `1024px` (iPad landscape), `1280px` (desktop).

## Technical considerations

- **RTL** stays as-is (`dir="rtl"`, `lang="ar"` on `<html>`). All inline styles and Tailwind utilities must respect RTL.
- **Dark mode** - out of scope for this redesign. Drop dark-mode classes during migration; revisit later if requested.
- **Container widening** - change `app.config.ts` `container.constrained` from `max-w-2xl` to `max-w-6xl` (~1080px).
- **Tailwind config** - extend `theme.colors` with the new tokens.
- **Animations** - keep page transitions; no scroll-triggered animations (stay calm).
- **Icons** - drop service/navbar icons. Keep social icons in footer only. The current `nuxt-icon` dependency stays but usage shrinks.
- **Existing modules** - keep `@nuxt/ui`, `@nuxt/content`, `@nuxtjs/seo`, `nuxt-gtag`, `motion-v` (used elsewhere), `vue-use-fixed-header` (drop with old navbar).
- **Floating navbar** - replace with sticky-top nav. Drop `vue-use-fixed-header`.
- **Newsletter widget** (`gohodhod.com` iframe) - drop entirely.
- **ProductAlert** floating banner - delete.
- **SEO** - preserve current meta titles, descriptions, and JSON-LD on `pages/index.vue`. Update copy where it mirrors the rewritten hero.
- **Performance** - `@nuxt/image` + `format=webp` for the avatar; halo and decorative SVGs are inline (no extra requests).

## Content prerequisites (Sufyan provides before implementation)

Implementation can start without these, but the page can't ship truthfully until they're confirmed:

1. **Stats numbers** - confirm `+12 منتج`, `+8 سنوات`, `+30 مؤسس`, `24س زمن الرد`, or supply real figures. The numbers in mockups are estimates.
2. **Testimonials** - at least 2 real quotes with first name, role, and context (e.g., "مؤسس · شركة ناشئة في الرياض"). Approve any anonymization.
3. **Project outcomes** - for each project in `content/projects`, supply a 1–2 sentence outcome (e.g., "بُنيت من الصفر إلى ١٠٠ مستخدم في ٣ أشهر") to replace the current single-line description.
4. **Photo** - existing `/public/avatar.jpg` is reused. Replace if a higher-resolution version is preferred.
5. **FAQ answers** - 4 questions are scaffolded (cost / scope / timeline / fit). Sufyan supplies the answers.
6. **Personas** - 3 founder archetypes are scaffolded (idea / early product / team). Confirm wording.

## Out of scope

- Dark mode visual treatment.
- Multi-language (English) version.
- CMS migration away from `@nuxt/content`.
- Analytics rework (keep umami + nuxt-gtag).
- Animation pass beyond existing page transitions.
- Build/`/build` section pages - leave content alone, just inherit new color tokens through the global stylesheet.
- Any backend changes (Resend contact API stays).

## Acceptance

The redesign is done when:

1. Home page renders all 13 sections with real content.
2. Services index, projects index, and articles index pick up the new design language.
3. Service detail and article detail pages still render correctly with new tokens.
4. Lighthouse Performance ≥ 90 on home (mobile).
5. RTL layout is correct on hero, all grids, and footer at 375px, 390px, 768px, 1024px, and 1280px (per responsive table).
6. The 7 trust UX patterns (above) are present and consistent.
7. No floating ProductAlert, no icon-only navbar, no `max-w-2xl` constraint.
