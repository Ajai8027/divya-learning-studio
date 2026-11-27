# Divya Learning Studio — responsive React landing page

Live frontend preview: **https://divya-learning-studio.vercel.app**

## Overview

A responsive, accessible landing page built from the supplied desktop/mobile SVG and PNG references and `CONTENT_AND_DESIGN.md`. The page includes all seven requested components, a validated registration form, local API integration, and a clearly labelled demo mode for the static deployment.

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
├── api/                         # Supplied local registration API (standard library Python)
├── evidence/                    # Screenshots, build/audit logs, browser result JSON
├── public/
│   ├── assets/
│   │   ├── divya_logo.svg
│   │   └── learning_dashboard_illustration.webp
│   └── favicon.svg
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
│   └── live-check.mjs           # Live Vercel preview smoke test
├── ACCEPTANCE_TEST_LOG.csv
├── COMPLETION_NOTE.md
└── README.md
```

## Local setup

Requirements: Node.js 18+, npm, and Python 3.9+ for the optional local API.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The development server defaults to the local registration endpoint even if `.env` is absent. To make the endpoint explicit, copy `.env.example` to `.env`.

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

Success: `201` with `{ "status": "received", "request_id": "REQ-..." }`.
Invalid input: `422`. The supplied server only emits CORS headers for `http://localhost:5173`, so it is a development-only backend.

## Form behaviour

- Controlled inputs with required, email-format, program and consent validation.
- Accessible field errors using `aria-invalid`, `aria-describedby` and `role="alert"`.
- Loading state disables controls and exposes `aria-busy`.
- `422`, server, timeout and network failures produce distinct messages.
- The exact success message is shown **only** after a real `201`.
- On a static production build without a configured reachable API, the form validates locally and displays: “Validation passed. This preview is in demo mode, so your enquiry was not transmitted.” It never claims a successful submission.

To connect a real deployed backend, set `VITE_REGISTRATION_API_URL` to an HTTPS endpoint at build time and update that backend's CORS policy. No credentials or secrets are stored in the repository.

## Testing

```bash
npm run build                 # Production build
npm run test:browser          # Edge/Chromium suite against http://localhost:5173
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

The automated suite covers 320, 375, 390, 768, 1200 and 1440 px widths, horizontal overflow, image loading, anchor targets, mobile-menu keyboard behaviour, skip-link focus order, all validation cases, API success, `422`, offline API and demo mode. Results are in `ACCEPTANCE_TEST_LOG.csv` and `evidence/`.

## Deployment

Vercel auto-detects Vite (`vite build`, output `dist`). The live URL above serves the static frontend only. Because the supplied API is local-only, the live preview operates in demo mode until a production backend is independently deployed and configured.

## Notes

- Copy follows `CONTENT_AND_DESIGN.md` as the primary source; the SVG references guided layout, hierarchy, colors and spacing.
- The WebP illustration and SVG logo are supplied brand assets, not third-party artwork.
- The production build completes with zero npm audit vulnerabilities.
- GitHub repository link is provided in the final submission.
