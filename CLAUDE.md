# CLAUDE.md — Plan Set Prints website

Single-page static site for a large-format blueprint printing business. Everything
lives in `index.html` (HTML + CSS + JS, no build step, no package.json). The order
backend is a Google Apps Script whose source is `apps-script/Code.gs`.
`PROJECT-NOTES.md` is the long-form record of decisions and outstanding work —
keep it updated when decisions change.

## Business

- **Name:** Plan Set Prints (name is settled — don't suggest rebrands)
- **Owner:** Taelor Wright
- **Address:** 55 N University Ave, Suite 227, Provo, UT 84601
- **Phone:** (435) 730-7705 · **Email:** plansetprints@gmail.com
- **Service area:** Utah County — Provo, Orem, Lehi, American Fork, Springville, Pleasant Grove
- **Turnaround:** 1–3 business days standard; next-day rush is +35%
- **Model:** quote-then-invoice (confirm files before charging), not pay-upfront.
  Invoicing via Square (not yet set up).

### Pricing (per sheet) — NOT yet verified against real rates; confirm before launch

| Size  | B&W   | Color  |
|-------|-------|--------|
| 18×24 | $2.00 | $4.00  |
| 24×36 | $3.00 | $6.00  |
| 30×42 | $5.00 | $8.00  |
| 36×48 | $7.25 | $10.00 |

Rush +35%. Bulk 50+ sheets: contact for pricing.

## Brand

CSS custom properties at the top of `index.html` (`:root`):

| Var             | Hex       | Use                                      |
|-----------------|-----------|------------------------------------------|
| `--navy-dark`   | `#1e3f6f` | Nav bar, footer, order email header      |
| `--navy`        | `#2b5592` | Pricing section bg, headings             |
| `--orange`      | `#e08a2a` | CTAs, accent stripe, rush highlights     |
| `--navy-light`  | `#edf2f9` | Hover states                             |
| `--orange-hover`| `#c97820` | CTA hover                                |
| `--orange-light`| `#fef5eb` | Rush badges                              |

Typeface: Inter. Logo: house outline with rolled plans, navy + orange.
Logo files in `img/` are cropped/resized from the masters in Drive at
`My Drive/Plan Set Prints/Plan Set Prints/Done/` (`long.png` → `img/logo.png` in the
white nav bar; `Transparent.png` house → `img/favicon.png`; `Logo White.png` PSP house →
`img/apple-touch-icon.png`). The logo blue doesn't read on navy, so the nav is white.
Style: clean, white background, professional, **simple** — an earlier version was
rejected for being too busy. Lean toward less. The order email in `Code.gs` has its
own `NAVY`/`ORANGE` constants; keep them in sync with the site.

## Order pipeline

Submit flow in `index.html` (~line 560 onward), in priority order:

1. **Google Apps Script (primary)** — `UPLOAD_URL` + `UPLOAD_KEY` constants.
   Site POSTs order JSON + base64 files; script checks the key, saves files to
   Drive under `Plan Set Prints — Orders / [date] — [customer] ([company])`, and
   sends ONE styled order email to plansetprints@gmail.com with the folder link.
   - Endpoint: `https://script.google.com/macros/s/AKfycbwPLC7smILQcTgI-zXnHGVRl2uXhN9nkd8W-wXkFll0X7Ctv0qSUgZVgYHgfLnjJ0pdzw/exec`
   - Shared key: `psp-7f3k9x2m` (must match `UPLOAD_KEY` in both files)
   - Project "Plan Set Prints" at script.google.com, owned by plansetprints@gmail.com
   - Limits: 12 files, 35MB/file, 90MB/order; pdf, dwg, dxf, tif, tiff only.
     If you change limits, change both `index.html` and `Code.gs`.
2. **EmailJS (fallback only)** — fires only if the Apps Script request fails
   outright; sends order details without files so the lead isn't lost.
   - Public key `GfhzLLe_u4w7Y0iJJ`, service `service_tyspguh`, template `template_f7fk669`
   - Account plansetprints@gmail.com, free tier: 200 emails/mo, 2 templates, 500KB attachments
   - Template: Subject `{{subject}}`, To `plansetprints@gmail.com`, Reply-To `{{reply_to}}`,
     Content **`{{{body}}}`** (triple braces).
   - Ignore the separate Ridgeline Scanning EmailJS account (`service_usmg3tz`) — unrelated.
3. **mailto:** last resort.

Note: `README.md`'s EmailJS setup section is outdated (describes EmailJS as the main path).

## Gotchas — these cost real time before

- **Apps Script responses are unreadable.** The site POSTs with `mode: 'no-cors'`
  because Apps Script redirects cross-origin. That's why the *script* sends the
  email rather than returning data to the site. Don't try to read the response.
- **Editing `Code.gs` does nothing until redeployed.** The repo copy is only a
  backup — changes must be pasted into the script editor, then:
  Deploy → **Manage deployments** → pencil → **Version: New version** → Deploy.
  Leaving the version dropdown alone silently redeploys the OLD code (happened twice).
- **Never use "New deployment"** — it creates a new URL and breaks the site.
- **Verify the live version** by opening the `/exec` URL in a browser: it should say
  "order endpoint is live." "upload endpoint" means it's stale.
- **EmailJS template must use `{{{body}}}`** — two braces HTML-escapes it and the
  email arrives as raw markup. The single biggest setup gotcha.
- This repo lives inside Google Drive; if git acts strangely (conflicted copies in
  `.git`, missing objects), Drive sync is the likely cause.

## Hosting & deployment

- Repo: github.com/taelor-web/plansetprints, branch `main`. GitHub Pages deploys on push.
- Test site: https://taelor-web.github.io/plansetprints/
- Production domain plansetprints.com is **still on Wix** (renews Jul 22 2026, $34/yr,
  notices to taelor@knightonarchitecture.com). **Do NOT change DNS or add a `CNAME`
  file until testing is signed off.**

## Outstanding (see PROJECT-NOTES.md for detail)

Square account · GA4 analytics · verify pricing · fix Wix site (social icons point
at Wix's accounts; Privacy/Refund/Terms pages blank) · Google Business Profile ·
point domain at GitHub Pages. Later: admin dashboard (would need Netlify/Vercel +
Supabase) — wait until real orders are flowing.

## Rules

- Never commit GitHub tokens or passwords. (The Apps Script key and EmailJS public
  key are client-side by design and already public in `index.html`.)
