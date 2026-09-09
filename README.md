# ABC Tutoring prototype

Run `npm install`, then `npm run dev`. Open http://localhost:3000.

Routes: `/` home and tutor browsing; `/tutors` listing; booking dialog; `/insights` aggregate local telemetry.

Sample tutors, stock portraits, rates and rolling six-slot schedules are illustrative. One-hour slots use Pacific Time. No accounts or payments.

## Integrations
Copy `.env.example` to `.env.local`. Set your PostHog project token and regional ingestion host. Server-side `posthog-node` forwards validated events. No parent/student names, emails, or form values are included in telemetry. The local event log works without credentials. Configure Resend, a verified sender (`BOOKING_FROM_EMAIL`), and Dana's recipient (`BOOKING_NOTIFY_EMAIL`) to deliver notifications on new bookings. Missing keys leave a queued local outbox; failures are marked failed. Automatic outbox retry is not implemented.

Events: `page_viewed`, `tutor_viewed`, `subject_searched`, `booking_started`, `booking_abandoned` (explicit dialog close), and authoritative `booking_completed`. Analyze an ordered page-view → profile-view → booking-start → completion funnel in PostHog, with conversion window 7 days. Breakdown profile views by tutor_id, subject searches by subject, and completed bookings by source. Overall drop-off is inferred from the funnel, not browser close events. Slot selections can repeat. IDs represent browser sessions.

Facebook link: `/?utm_source=facebook&utm_medium=social&utm_campaign=local_parents`. The current implementation categorizes source; medium/campaign are not collected.

## Persistence and launch boundaries
SQLite at `.data/prototype.sqlite` persists across refreshes and server restarts. A UNIQUE constraint prevents double bookings across clients. Requires Node 22 and a persistent disk; this existing Next.js/SQLite application cannot be directly packaged as a Sites Cloudflare Worker. It has not been deployed.

Before launch replace sample data, add owner-only analytics access, database backups, notification retries, abuse protection, a privacy notice, and a real schedule source (Google Sheets sync is not implemented). Do not enter real family details in this prototype. No publicly accessible booking-detail endpoint exists. The aggregate insights route is public for demonstration.

Validation: `npm run build`, `npm run lint`, and `node scripts/check-booking.mjs` with the server running. The script books a sample slot and verifies conflict handling and visibility. Test data remains in the local database and is included in insights.
# Upskilling-Together-Ynha-Nguyen.github.io
