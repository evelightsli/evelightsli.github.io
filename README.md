# Eve Lights website

The website for Eve Lights, LLC (Christmas light installation, Nassau and Suffolk County, Long Island).
Production URL: https://evelightsli.com (GitHub Pages, also reachable at https://evelightsli.github.io).

## How updates go live

Edit, commit, push to `main`. That is the whole process.

Every push to `main` runs `.github/workflows/deploy.yml`, which checks the site
(`scripts/check.mjs`: missing files, broken in-page links, invalid structured data) and then
publishes it to GitHub Pages. If a check fails, nothing is published and the last good version stays live.

Requires: repository Settings > Pages > Source set to **GitHub Actions**.

## What is where

| Path | What |
| --- | --- |
| `index.html` | The whole site: markup, styles and scripts |
| `assets/img/` | Project photos (`pNN-720.webp` thumbnails, `pNN-1800.webp` full size), logo, hero and sharing image |
| `assets/fonts/`, `assets/js/` | Self-hosted fonts and the 3D library for the lighting preview |
| `404.html`, `robots.txt`, `sitemap.xml` | Not-found page and search engine files |

## Common edits

- **Add a portfolio photo:** save it as `assets/img/pNN-720.webp` (720px on the long side) and
  `assets/img/pNN-1800.webp` (up to 1800px), then add a line to the `PH` list in `index.html`:
  `["pNN", width, height, "Short description of the photo"]`.
- **Change text, FAQs or towns:** edit `index.html` directly. If you change an FAQ, update the matching
  entry in the `application/ld+json` block near the top as well.
- **Quote form:** submissions are emailed to the address in `FORM_EMAIL` (in `index.html`) through
  FormSubmit (free, no account). A new address or a new domain has to be activated once by clicking the
  link in the activation email FormSubmit sends on the first submission.

## Rollback

The pre-upgrade site is preserved on the `backup/pre-upgrade-2026-11-11` branch.
