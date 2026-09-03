# Plan Set Prints — Project Notes

> **For Claude:** read this file first. It contains all live config, decisions
> made so far, and what's still outstanding. Everything here is safe to read
> aloud except where noted.

---

## Business

| | |
|---|---|
| Name | Plan Set Prints |
| Owner | Taelor Wright |
| Address | 55 N University Ave, Suite 227, Provo, UT 84601 |
| Phone | (435) 730-7705 |
| Email | plansetprints@gmail.com |
| Service area | Utah County (Provo, Orem, Lehi, American Fork, Springville, Pleasant Grove) |
| Turnaround | 1–3 business days standard; next-day rush (+35%) |

**Name decision:** kept "Plan Set Prints" after researching alternatives.
Valley Print and Wasatch Print both had serious conflicts — multiple existing
Utah print shops plus Wasatch Computer Technology (printing software company)
owning wasatch.com. Plan Set Prints is uncontested and matches search intent.
Revisit only if there's a name he loves, not to avoid harder work.

## Brand

| Token | Hex | Use |
|---|---|---|
| Navy dark | `#1e3f6f` | Nav bar, footer, order email header |
| Navy | `#2b5592` | Pricing section background, headings |
| Orange | `#e08a2a` | CTAs, accent stripe, rush highlights |
| Navy light | `#edf2f9` | Hover states |

Typeface: Inter. Logo is a house outline with rolled plans, navy + orange.
Style direction: clean, white background, professional. Keep it simple —
he pushed back on an earlier version for being too busy.

## Pricing (per sheet)

| Size | B&W | Color |
|---|---|---|
| 18×24 | $2.00 | $4.00 |
| 24×36 | $3.00 | $6.00 |
| 30×42 | $5.00 | $8.00 |
| 36×48 | $7.25 | $10.00 |

Rush +35%. Bulk 50+ sheets: contact for pricing.
**Not yet verified against what he actually charges — confirm before launch.**

## Hosting

- **Repo:** github.com/taelor-web/plansetprints
- **Live (test):** https://taelor-web.github.io/plansetprints/
- **Production:** plansetprints.com — still on Wix, renews Jul 22 2026 ($34/yr,
  billed through Wix, notice goes to taelor@knightonarchitecture.com).
  Do NOT switch DNS until testing is done.
- Single file: `index.html`. No build step.

## Google Apps Script (orders + file uploads) — PRIMARY

**Endpoint:** `https://script.google.com/macros/s/AKfycbwPLC7smILQcTgI-zXnHGVRl2uXhN9nkd8W-wXkFll0X7Ctv0qSUgZVgYHgfLnjJ0pdzw/exec`
**Shared key:** `psp-7f3k9x2m` (sent with every request; script rejects without it)
**Project:** script.google.com, "Plan Set Prints", owned by plansetprints@gmail.com

This handles everything: receives the order + files, saves files to Drive under
`Plan Set Prints — Orders / [date] — [customer] ([company])`, then sends ONE
styled order email with the Drive folder link. Source is `plansetprints-upload.gs`.

Limits: 12 files, 35MB per file, 90MB per order. Allowed: pdf, dwg, dxf, tif, tiff.
Order folders are private — accessed through his own Drive.

**GOTCHAS — these cost real time during setup:**
1. The site POSTs with `mode: 'no-cors'` because Apps Script redirects
   cross-origin and the browser can't read the response. That's why the script
   sends the email itself rather than returning a link to the site.
2. **Editing the script does nothing until redeployed.** Deploy → Manage
   deployments → pencil icon → **Version: New version** → Deploy. Leaving the
   version dropdown alone silently redeploys the OLD code. This bit us twice.
3. To verify which version is live, open the `/exec` URL in a browser. It should
   say "order endpoint is live." If it says "upload endpoint", it's stale.
4. Use Manage deployments, not New deployment — a new one changes the URL.

## EmailJS (fallback only)

| | |
|---|---|
| Public Key | `GfhzLLe_u4w7Y0iJJ` |
| Service ID | `service_tyspguh` |
| Template ID | `template_f7fk669` |
| Account | plansetprints@gmail.com |
| Free tier | 200 emails/month, 2 templates, 500KB attachment cap |

**Template must use triple braces `{{{body}}}`** in Content — two braces
escapes the HTML and the email arrives as raw markup. Subject is `{{subject}}`,
To Email is `plansetprints@gmail.com`, Reply To is `{{reply_to}}`.
This was the single biggest gotcha during setup.

**No longer the primary path.** EmailJS only fires if the Apps Script request
fails outright — it sends order details without the file link so a lead is never
lost. Below that there's a mailto fallback as a last resort.

There is a separate Ridgeline Scanning EmailJS account (different login,
service_usmg3tz) — unrelated, and he couldn't access it.

## Decisions made

- **Quote-then-invoice**, not pay-upfront. Print jobs go wrong in predictable
  ways (miscounted pages, wrong sheet size), so confirm files before charging.
- **Square** recommended over QuickBooks for invoicing — $0/month vs ~$35/month,
  and he's pre-revenue. Square estimates convert to invoices in one click.
  Push ACH for large orders (1% vs ~3.3% card).
- **Google Apps Script** for file uploads rather than a third-party service —
  free, files land in his own Drive, works with static hosting.

## Outstanding

- [x] Deploy Apps Script endpoint, wire into site — DONE, working end to end
- [ ] Create Square account
- [ ] Google Analytics 4 for visitor tracking
- [ ] Verify pricing is current
- [ ] Fix Wix site: social icons point at Wix's own accounts; Privacy Policy,
      Refund Policy and Terms pages are blank placeholders
- [ ] Google Business Profile (high impact for local search)
- [ ] Point domain at GitHub Pages once testing passes

## Later (not now)

Custom admin dashboard with login — estimates, invoice status, revenue.
Requires moving hosting to Netlify or Vercel plus Supabase for database and
auth. Very doable, but wait until real orders are flowing so it's built
around actual workflow. Google Analytics covers the visitor-tracking half
in the meantime.

---

**Not stored here:** GitHub token, any passwords. Those stay out of the repo.
