import Link from "next/link";

import { AccountMenu } from "@/features/auth/account-menu";
import { getCurrentUser } from "@/features/auth/session";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

const footerSections = [
  {
    links: [
      ["Features", "/#features"],
      ["Integrations", "/#integrations"],
      ["Pricing", "/pricing"],
      ["Changelog", "/contact"],
    ],
    title: "Product",
  },
  {
    links: [
      ["Help Center", "/contact"],
      ["CSV Guides", "/etsy-csv-converter"],
      ["Accounting Guides", "/csv-to-quickbooks"],
      ["Blog", "/contact"],
    ],
    title: "Resources",
  },
  {
    links: [
      ["About", "/contact"],
      ["Contact", "/contact"],
    ],
    title: "Company",
  },
  {
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Cookie Policy", "/privacy"],
    ],
    title: "Legal",
  },
];

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md border border-teal-200 bg-teal-50">
        <span className="h-2 w-5 rounded-full border-y-2 border-teal-700" />
      </span>
      <span>{SITE_NAME}</span>
    </span>
  );
}

export async function PublicHeader() {
  const { user } = await getCurrentUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link className="text-lg font-black text-slate-950" href="/">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          <Link className="transition hover:text-slate-950" href="/#product">
            Product
          </Link>
          <Link className="transition hover:text-slate-950" href="/#integrations">
            Integrations
          </Link>
          <Link className="transition hover:text-slate-950" href="/#how-it-works">
            How It Works
          </Link>
          <Link className="transition hover:text-slate-950" href="/pricing">
            Pricing
          </Link>
          <Link className="transition hover:text-slate-950" href="/#resources">
            Resources
          </Link>
        </nav>
        {user ? (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link
              className="hidden text-teal-800 transition hover:text-teal-900 sm:inline"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <AccountMenu email={user.email} />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link className="text-slate-600 transition hover:text-slate-950" href="/login">
              Sign In
            </Link>
            <Link
              className="rounded-md bg-teal-700 px-4 py-2 text-white transition hover:bg-teal-800"
              href="/upload"
            >
              Start for Free
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
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Link className="text-xl font-black text-slate-950" href="/">
              <BrandMark />
            </Link>
            <p className="mt-3 max-w-sm text-sm font-semibold text-teal-800">
              {SITE_TAGLINE}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              AI-powered commerce data automation for online sellers and finance
              teams.
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
          {SITE_NAME} prepares commerce data for bookkeeping review. It is not tax,
          legal, or accounting advice.
        </div>
        <p className="mt-6 text-sm text-slate-500">
          (c) 2026 {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
