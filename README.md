# Divya Learning Studio — responsive React landing page

Live frontend preview: **https://divya-learning-studio.vercel.app**

## Overview

A responsive, accessible landing page built from the supplied desktop/mobile SVG references and `CONTENT_AND_DESIGN.md`. It includes all seven requested components, a validated registration form, local API integration, a clearly labelled demo mode, and a **self-contained offline build** that opens directly from `index.html` with no internet connection.

## Quick start — offline version

Double-click **`index.html`** in this folder (or open `file:///.../index.html` in any modern browser). That single file contains the complete page: React bundle, all CSS, the SVG logo/favicon, and the WebP illustration are inlined as data URIs. No server, installation, or network access is required.

The offline form keeps full validation. Because there is no backend, submitting it shows: “Validation passed. This preview is in demo mode, so your enquiry was not transmitted.” It never claims a successful submission.

> `index.html` is generated output. To change the design, edit `index.dev.html` and `src/`, then run `npm run build:offline`.

## Technology stack

- React 18 + Vite 6
- HTML5, ES6+, modular CSS with CSS Modules
- JavaScript validation and `fetch` for API integration
- WebP artwork and SVG logo
- Playwright Core for browser testing (system Microsoft Edge and Playwright Firefox)
- Vercel for static hosting

## Project structure

```text
.
├── api/                         # Supplied local registration API (Python stdlib)
├── evidence/                    # Screenshots, build/audit logs, browser result JSON
├── public/
│   ├── assets/
│   │   ├── divya_logo.svg
│   │   └── learning_dashboard_illustration.webp
│   └── favicon.svg
├── scripts/
│   └── build-offline.mjs        # Builds self-contained root index.html
├── src/
│   ├── components/
│   │   ├── Benefits.jsx / .module.css
│   │   ├── FAQ.jsx / .module.css
│   │   ├── Footer.jsx / .module.css
│   │   ├── Header.jsx / .module.css
│   │   ├── Hero.jsx / .module.css
│   │   ├── Programs.jsx / .module.css
│   │   ├── RegistrationForm.jsx / .module.css
│   │   └── RegistrationSection.jsx / .module.css
│   ├── data/siteContent.js      # Single source of approved copy and program options
│   ├── styles/base.css          # Design tokens, reset, layout container, focus styles
│   ├── utils/registration.js    # Validation, endpoint selection, POST handling
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── browser-check.mjs        # Six-viewport layout/navigation/form suite
│   ├── live-check.mjs           # Live Vercel preview smoke test
│   └── offline-check.mjs        # file:// offline suite (Edge + Firefox)
├── .env.example
├── .gitignore
├── ACCEPTANCE_TEST_LOG.csv
├── COMPLETION_NOTE.md
├── index.dev.html               # Vite development entry
├── index.html                   # GENERATED self-contained offline page
├── package-lock.json
├── package.json
├── vite.config.js               # Development/production config
├── vite.offline.config.js       # Offline single-file config
└── README.md
```

## Local development

Requirements: Node.js 18+, npm, and Python 3.9+ for the optional local API.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The development server serves `index.dev.html` and defaults to the local registration endpoint even if `.env` is absent. To make the endpoint explicit, copy `.env.example` to `.env`.

### Rebuild the offline page

```bash
npm run build:offline   # regenerates root index.html (~180 KB, zero external requests)
npm run build           # normal Vite build to dist/ for hosting
npm run build:all       # both builds
```

`npm run build:offline` uses `vite.offline.config.js` with a relative base and IIFE output, inlines CSS and JavaScript, embeds all assets as data URIs, removes preload links, and moves the bundle to the end of `<body>` so it works from `file://`. It fails the build if any external script, stylesheet, image, or asset path remains.

### Local registration API

```bash
python api/server.py
# Health check: http://localhost:8765/health
```

Contract:

```http
POST http://localhost:8765/api/register
Content-Type: application/json
```

```json
{
  "full_name": "Example Learner",
  "email": "learner@example.com",
  "program": "Digital Foundations",
  "consent": true
}
```

Success: `201` with `{ "status": "received", "request_id": "REQ-..." }`. Invalid input: `422`. The supplied server only emits CORS headers for `http://localhost:5173`, so it is a development-only backend.

## Form behaviour

- Controlled inputs with required, email-format, program and consent validation.
- Accessible field errors using `aria-invalid`, `aria-describedby` and `role="alert"`.
- Loading state disables controls and exposes `aria-busy`.
- `422`, server, timeout and network failures produce distinct messages.
- The exact success message is shown **only** after a real `201`.
- On static production builds and in the offline file, the form validates locally and displays: “Validation passed. This preview is in demo mode, so your enquiry was not transmitted.” It never claims a successful submission.

To connect a real deployed backend, set `VITE_REGISTRATION_API_URL` to an HTTPS endpoint at build time and update that backend's CORS policy. No credentials or secrets are stored in the repository.

## Testing

```bash
npm run build                 # Production build to dist/
npm run build:offline         # Self-contained index.html
npm run test:browser          # Edge/Chromium suite against http://localhost:5173
npm run test:offline          # file:// suite in Edge and Firefox
```

For Firefox (installed once with `npx playwright-core install firefox`):

```bash
BROWSER=firefox npm run test:browser
DEMO_URL=http://localhost:4173 npm run test:browser   # Includes production demo-mode check
node tests/live-check.mjs                            # Live Vercel URL smoke test
```

On Windows PowerShell, set variables first, for example:

```powershell
$env:BROWSER='firefox'; npm run test:browser
```

Each browser run is stored under a key in `evidence/browser-results.json` (`chromium`, `firefox`, or `chromium-demo` by default). Set `RESULT_KEY` to use a custom key.

The suites cover 320, 375, 390, 768, 1200 and 1440 px widths, horizontal overflow, image loading, anchor targets, mobile-menu keyboard behaviour, skip-link focus order, all validation cases, API success, `422`, offline API, demo mode, and — for the local file — zero network requests. Results are in `evidence/browser-results.json`, `evidence/offline-check-results.json`, and `evidence/live-check-results.json`. The human-readable summary is `ACCEPTANCE_TEST_LOG.csv`.

## Deployment

Vercel auto-detects Vite (`vite build`, output `dist`, entry renamed to `index.html`). The live URL serves the static frontend only. Because the supplied API is local-only, the live preview operates in demo mode until a production backend is independently deployed and configured. The offline `index.html` is committed separately and is not used by the Vercel build.

## Notes

- Copy follows `CONTENT_AND_DESIGN.md` as the primary source; the SVG references guided layout, hierarchy, colors and spacing.
- The WebP illustration and SVG logo are supplied brand assets, not third-party artwork.
- The production build completes with zero npm audit vulnerabilities.
- GitHub repository link is provided in the final submission.
