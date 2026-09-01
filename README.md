# Plan Set Prints

Professional large-format blueprint printing for contractors, architects, and engineers in Utah County.

**Live site:** [plansetprints.com](https://www.plansetprints.com)

## Setup

This is a single-page static site hosted on GitHub Pages. No build step required.

### To connect the estimate form (EmailJS):

1. Create an account at [emailjs.com](https://www.emailjs.com)
2. Add your Gmail (plansetprints@gmail.com) as an Email Service
3. Create an Email Template with these variables: `{{name}}`, `{{company}}`, `{{email}}`, `{{phone}}`, `{{items}}`, `{{files}}`, `{{turnaround}}`, `{{delivery}}`, `{{notes}}`, `{{total}}`
4. In `index.html`, find the EmailJS comment block in the submit function and add your Service ID, Template ID, and Public Key

### Custom domain

To connect `plansetprints.com`:
1. In the repo Settings → Pages, add your custom domain
2. Update your domain's DNS:
   - A records pointing to GitHub Pages IPs
   - Or a CNAME record pointing to `taelor-web.github.io`

## Files

- `index.html` — The entire site (single file, no dependencies beyond CDN fonts and pdf.js)
- `CNAME` — Custom domain config (add when ready)
