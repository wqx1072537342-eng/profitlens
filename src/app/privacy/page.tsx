import type { Metadata } from "next";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
  description:
    "FlowSync AI privacy policy for Etsy CSV uploads, report data, data handling, and deletion requests.",
  title: "Privacy Policy",
};

const sections = [
  [
    "What information we collect",
    "FlowSync AI collects account email, uploaded CSV metadata, parsed report data, warnings, generated reports, and download events needed to operate the beta product.",
  ],
  [
    "Uploaded CSV and report data",
    "Uploaded CSV data is used to detect file types, generate profit previews, show warnings, and create downloadable reports for bookkeeping preparation.",
  ],
  [
    "What we do not do",
    "FlowSync AI does not ask for your Etsy password and does not connect to your Etsy account in the current beta.",
  ],
  [
    "Service providers",
    "FlowSync AI uses hosting, authentication, and database providers such as Vercel and Supabase to operate the product.",
  ],
  [
    "Data deletion requests",
    "You can request data deletion by contacting support@flowsyncdata.com from the email associated with your account.",
  ],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="text-5xl font-black leading-tight">Privacy Policy</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          FlowSync AI is an Etsy-first bookkeeping preparation tool. This page explains
          how the current beta handles account, CSV, report, and download data.
        </p>
        <div className="mt-8 grid gap-4">
          {sections.map(([title, body]) => (
            <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm" key={title}>
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          Contact: support@flowsyncdata.com
        </p>
      </section>
      <PublicFooter />
    </main>
  );
}
