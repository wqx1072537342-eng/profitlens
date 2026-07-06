# Sprint Plan

The MVP is planned as five focused sprints. Each sprint should produce something usable and avoid expanding beyond Etsy Profit Report.

## Sprint 1 Project Setup & Auth

Goal:

- Create the technical foundation and basic user account flow.

Tasks:

- Set up Next.js project structure.
- Set up basic styling and layout.
- Implement signup.
- Implement login.
- Implement logout.
- Create protected dashboard route.
- Create initial database schema for users.

Done when:

- A user can create an account, log in, log out, and access a protected page.

## Sprint 2 CSV Upload

Goal:

- Let users upload Etsy CSV files and see validation results.

Tasks:

- Build upload page.
- Support multiple CSV uploads.
- Save upload metadata.
- Detect empty or invalid CSV files.
- Show file names and status.
- Show missing field warnings.

Done when:

- A logged-in user can upload Etsy CSV files and see whether the files are accepted or need review.

## Sprint 3 CSV Parser & Calculation

Goal:

- Convert Etsy CSV rows into profit report data.

Tasks:

- Identify supported Etsy CSV types.
- Parse sales.
- Parse refunds.
- Parse fees.
- Parse ads.
- Parse shipping.
- Parse tax.
- Calculate net profit before COGS.
- Support optional COGS input.
- Calculate net profit after COGS.

Done when:

- Uploaded CSV files generate a reliable profit calculation with warnings instead of crashes.

## Sprint 4 Dashboard & Export

Goal:

- Make the result understandable and downloadable.

Tasks:

- Build dashboard summary cards.
- Build fee and tax breakdown tables.
- Build warning section.
- Build report preview page.
- Generate Excel export.
- Generate PDF export.
- Include source notes in exports.

Done when:

- A seller can understand profit and download a CPA-ready report from parsed CSV data.

## Sprint 5 Free Download & Launch

Goal:

- Add the free download flow and launch the MVP.

Tasks:

- Add download page.
- Add free Excel download.
- Add free PDF download.
- Add basic download tracking.
- Add future pricing waitlist or feedback prompt if needed.
- Add launch checklist.
- Test full user flow.

Done when:

- A user can complete signup, upload, preview, and free download.
- The product is ready to show to first Etsy sellers.
