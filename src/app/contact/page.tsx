import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/contact"),
  },
  description:
    "Contact FlowSync AI for Etsy CSV import issues, report feedback, CPA export requests, and paid beta interest.",
  title: "Contact FlowSync AI",
};

const contactReasons = [
  "CSV recognition issue",
  "Report calculation question",
  "Missing Etsy fee category",
  "CPA or export format feedback",
  "Paid beta interest",
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="text-5xl font-black leading-tight">Contact FlowSync AI</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            For product support, CSV import issues, report feedback, or paid beta
            interest, contact us by email.
          </p>
          <Link
            className="mt-8 inline-flex items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
            href="mailto:support@flowsyncdata.com?subject=FlowSync AI%20support"
          >
            Email support@flowsyncdata.com
          </Link>
        </div>
        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">What to include</h2>
          <div className="mt-5 grid gap-3">
            {contactReasons.map((reason) => (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={reason}>
                <p className="font-bold text-slate-950">{reason}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            Please do not email sensitive passwords or Etsy account credentials.
            FlowSync AI does not need your Etsy password.
          </p>
        </aside>
      </section>
      <PublicFooter />
    </main>
  );
}
