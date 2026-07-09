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

---

# Professional SaaS Upgrade Sprint Plan

Approved direction:

> Keep ProfitLens Etsy-first while upgrading the website and logged-in app into a professional SaaS experience.

Shopify, Amazon, AI, and paid plans can be Coming Soon or waitlist surfaces only. They must not become real functionality in this plan.

## Sprint 6 Professional SaaS Shell

Goal:

- Make ProfitLens look and navigate like a credible SaaS product while preserving the Etsy CSV workflow.

Tasks:

- Add logged-in app sidebar navigation.
- Add public Pricing page.
- Add route placeholders for Billing, Account, Settings, and Feedback.
- Make Coming Soon items visually clear.
- Keep existing upload, reports, and download flows working.

Done when:

- Logged-in user can navigate Dashboard, Data Import, Reports, Billing, Account, Settings, and Feedback.
- Unsupported features do not look active.
- Existing Etsy report flow still works.

## Sprint 7 Dashboard Upgrade

Goal:

- Turn `/dashboard` into an action-oriented SaaS workspace based on real report data.

Tasks:

- Add KPI cards from reports: revenue, fees, profit before COGS, profit after COGS, reports generated.
- Add next best action logic.
- Add recent report cards.
- Add data completeness summary.
- Add empty states for new users.

Done when:

- New users know to upload CSV.
- Returning users can continue from recent reports.
- Dashboard does not show fake metrics.

## Sprint 8 Account, Billing, Settings, Feedback

Goal:

- Add trust and feedback surfaces that support retention and paid validation.

Tasks:

- Build `/account` with email, business type, recent reports, and upload batches.
- Build `/billing` showing Free Beta plan, usage, and Coming Soon paid options.
- Build `/settings` with profile, notification, and security sections.
- Build `/feedback` with feedback categories and email contact.
- Decide whether feedback remains mailto or needs `feedback_messages`.

Done when:

- Users can manage basic account context.
- Users can understand current free plan.
- Users can send feedback about blockers.

## Sprint 9 Onboarding

Goal:

- Help a new Etsy seller reach first report value within 5 minutes.

Tasks:

- Add welcome page after signup or first login.
- Ask business type.
- Explain required Etsy CSV files.
- Guide first upload.
- Show validation and missing-file checklist.
- Send user to Dashboard or Report after first Profit Preview.

Done when:

- New user can understand the first action without reading documentation.
- Onboarding remains Etsy-first.

## Sprint 10 Conversion Learning

Goal:

- Learn whether users would pay before implementing real billing.

Tasks:

- Add paid beta waitlist CTA.
- Track clicks manually or with simple usage logs only if approved.
- Improve Pricing copy.
- Add feedback question: "I would pay for this if..."
- Prepare first paid experiment recommendation.

Done when:

- Founder has evidence for or against $19 one-time report or $19/month Pro.
- No payment gate blocks default free download.

## Sprint 11 Paid Experiment, Later Only

Goal:

- Add real monetization only after usage and paid-intent validation.

Possible tasks:

- Stripe Checkout for one-time report.
- Paid export variant.
- Pro plan.
- Usage limits.

Entry criteria:

- At least several real users complete upload -> report -> download.
- Feedback shows willingness to pay.
- Founder explicitly approves payment implementation.
