# Divya Learning Studio — final client deliverable

Live frontend preview: **https://divya-learning-studio.vercel.app**

## Open the website

Double-click **`index.html`** in this folder, or open `file:///.../index.html` in any modern browser. The page works fully offline: no server, installation, or internet connection is required.

`index.html` is the only HTML file and the only file needed to run the website. It contains the complete React bundle, all CSS, the SVG logo/favicon, and the WebP illustration inlined as data URIs.

The registration form keeps full client-side validation. With no backend available, a valid submission shows: “Validation passed. This preview is in demo mode, so your enquiry was not transmitted.” It never claims a successful submission.

> `index.html` is the final generated page. The `src/` and `public/` folders are included as reference copies of the original design assets; editing them will not change `index.html` because the build tooling has been removed from this final delivery folder.

## Folder structure

```text
.
├── api/                         # Reference copy of the supplied local registration API
├── evidence/                    # Screenshots, build/audit logs, browser result JSON
├── public/
│   ├── assets/
│   │   ├── divya_logo.svg
│   │   └── learning_dashboard_illustration.webp
│   └── favicon.svg
├── src/                         # Original React source (reference only)
│   ├── components/              # Components and CSS Modules
│   ├── data/siteContent.js      # Approved copy and program options
│   ├── styles/base.css          # Design tokens, reset, layout, focus styles
│   ├── utils/registration.js    # Validation and API handling
│   ├── App.jsx
│   └── main.jsx
├── tests/                       # Original verification scripts (reference only)
│   ├── browser-check.mjs
│   ├── live-check.mjs
│   └── offline-check.mjs
├── .env.example
├── .gitignore
├── ACCEPTANCE_TEST_LOG.csv
├── COMPLETION_NOTE.md
├── index.html                   # Final self-contained website
├── README.md
└── vercel.json                  # Static hosting configuration
```

## Included assets

- **Branding and icons:** `public/assets/divya_logo.svg`, `public/favicon.svg`
- **Image:** `public/assets/learning_dashboard_illustration.webp`
- **CSS:** `src/styles/base.css` plus eight component CSS Module files (all already inlined into `index.html`)
- **Fonts:** none — the design intentionally uses the system font stack (`system-ui, -apple-system, Segoe UI, Arial, sans-serif`); the logo SVG also uses system fonts
- **Screenshots:** 19 PNGs in `evidence/` (six viewport references, twelve Edge/Firefox verification captures, one live-site capture)
- **Reports:** `evidence/browser-results.json`, `evidence/offline-check-results.json`, `evidence/live-check-results.json`, `evidence/build-log.txt`, `evidence/audit-log.txt`

## Form behaviour

- Controlled inputs with required, email-format, program and consent validation.
- Accessible field errors using `aria-invalid`, `aria-describedby` and `role="alert"`.
- Loading state disables controls and exposes `aria-busy`.
- `422`, server, timeout and network failures produce distinct messages.
- The exact success message is shown **only** after a real `201`.
- In the delivered page, the form validates locally and shows the demo-mode notice described above, so it never implies a submission was transmitted.

A real backend would need to be deployed separately and configured with `VITE_REGISTRATION_API_URL` at build time. No credentials or secret values are included in this folder.

## Deployment

Vercel serves the committed `index.html` directly as a static file; `vercel.json` sets `framework: null`, so there is no build step and no Vite dependency. The live response is byte-identical to the local file (SHA-256 `596F8846F64F0185AF928B745955550EFBFDB53B373F6F47FA1F18618A76DE70`, 184,342 bytes).

## Verification records

- Local offline suite: 52/52 checks passed in Edge/Chromium and Firefox at 320, 375, 390, 768, 1200 and 1440 px — no horizontal overflow, inlined images loaded, console clean, zero network requests.
- Final live suite: 90/90 checks passed — HTTP 200, images/logo loaded, CSS applied, anchor targets present, no failed requests, mobile menu, FAQ expand/collapse, and form demo mode.
- `npm audit` recorded zero vulnerabilities before the build tooling was removed.

The scripts in `tests/` are kept only as a record of how those results were produced; they are not required to open or use the website.

## Notes

- Copy follows `CONTENT_AND_DESIGN.md` as the primary source; the supplied SVG references guided layout, hierarchy, colors and spacing.
- The WebP illustration and SVG logo are supplied brand assets, not third-party artwork.
- GitHub repository link is provided in the final submission.
