import Link from "next/link";

import { AccountMenu } from "@/features/auth/account-menu";
import { getCurrentUser } from "@/features/auth/session";

const footerSections = [
  {
    links: [
      ["Etsy Profit Report", "/etsy-profit-report"],
      ["Etsy Tax Report", "/etsy-tax-report"],
      ["Sample Report", "/sample-report"],
      ["Pricing", "/pricing"],
    ],
    title: "Product",
  },
  {
    links: [
      ["How it works", "/#how-it-works"],
      ["FAQ", "/#faq"],
      ["Contact", "/contact"],
    ],
    title: "Resources",
  },
  {
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
    ],
    title: "Company",
  },
  {
    links: [
      ["Log in", "/login"],
      ["Create account", "/signup"],
    ],
    title: "Account",
  },
];

export async function PublicHeader() {
  const { user } = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link className="text-lg font-black text-slate-950" href="/">
          ProfitLens
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          <Link className="transition hover:text-slate-950" href="/etsy-profit-report">
            Product
          </Link>
          <Link className="transition hover:text-slate-950" href="/#how-it-works">
            How it works
          </Link>
          <Link className="transition hover:text-slate-950" href="/sample-report">
            Sample report
          </Link>
          <Link className="transition hover:text-slate-950" href="/pricing">
            Pricing
          </Link>
          <Link className="transition hover:text-slate-950" href="/contact">
            Contact
          </Link>
        </nav>
        {user ? (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link className="hidden text-teal-800 transition hover:text-teal-900 sm:inline" href="/dashboard">
              Dashboard
            </Link>
            <AccountMenu email={user.email} />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link className="text-slate-600 transition hover:text-slate-950" href="/login">
              Log in
            </Link>
            <Link
              className="rounded-md bg-teal-700 px-4 py-2 text-white transition hover:bg-teal-800"
              href="/signup"
            >
              Start free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Link className="text-xl font-black text-slate-950" href="/">
              ProfitLens
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              Etsy-first bookkeeping preparation software for CSV-based profit
              reports and CPA review.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                {section.title}
              </p>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600">
                {section.links.map(([label, href]) => (
                  <Link className="transition hover:text-slate-950" href={href} key={href}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          ProfitLens is bookkeeping preparation software. It is not tax, legal, or
          accounting advice.
        </div>
        <p className="mt-6 text-sm text-slate-500">
          (c) 2026 ProfitLens. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
