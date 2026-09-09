# ABC Tutoring — static prototype

A friendly tutor directory and account-free booking demonstration, exported by Next.js for GitHub Pages.

## Run and build

Use Node 22. Run `npm ci`, then `npm run dev`. `npm run build -- --webpack` generates `out/`, including `/`, `/tutors/`, `/insights/`, and a 404 page. Serve `out/` with any static HTTP server. `npm run lint` checks source and `node scripts/check-static.mjs` checks exported routes, asset references, server dependencies, and private credential leakage (with `.env.local` available).

## Booking behavior

Bookings persist in localStorage and disappear from availability in the same browser. Storage events refresh other tabs, and Web Locks serialize reservations where supported. Availability is NOT shared across devices or browser profiles. Clearing site data resets demo bookings. Names and email are validated in the form but are not persisted or sent to analytics. No email, text, payment, account, or real reservation is created. Tutors, portraits, rates, and schedules are samples. Real service operation requires a shared backend and notification service.

## Analytics

Configure `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` at build time. These are public ingestion settings. Browser events go directly to PostHog; no server API is required. Events include page_viewed, tutor_viewed, subject_searched, booking_started, booking_abandoned (explicit close), and booking_completed (after successful local storage). Attribution uses source, including Facebook UTM links. Personal form details are excluded. `/insights/` shows up to 500 recent events from the current browser.

Shared synthetic demo dashboard: https://us.posthog.com/shared/zIyKZrWvntF1d5D7SrepGjkFe05X6A

Its six panels isolate `abc_dashboard_demo=true`; normal browser activity is tagged false and excluded. The personal key is only used by local management scripts, never bundled or added to GitHub build variables.

- `node scripts/posthog-dashboard.mjs --create`: reuse/create dashboard and enable sharing.
- `node scripts/posthog-demo.mjs`: send synthetic events once; repeated runs add traffic.
- `node scripts/posthog-verify.mjs`: run dashboard queries.

Local management requires POSTHOG_HOST (origin only), POSTHOG_PROJECT_ID, POSTHOG_PERSONAL_API_KEY in ignored `.env.local`, plus the ingestion settings above. Personal key scopes: dashboard and insight read/write, query read, sharing_configuration read/write.

## GitHub Pages

`.github/workflows/nextjs.yml` builds with Node 22 on pushes to main, uploads `out/`, and deploys to GitHub Pages. Repository Pages source must be GitHub Actions. Repository Actions variables `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` provide public analytics configuration. Never set the personal API key as a public variable.

`node scripts/configure-pages.mjs --configure` configures Pages and public variables using the existing local GitHub credential. `--status` reads recent workflow status. `.env.local`, `.data/`, and generated output are ignored.
