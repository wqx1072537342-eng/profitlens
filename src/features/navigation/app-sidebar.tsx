"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AccountMenu } from "@/features/auth/account-menu";

const primaryNavigation = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home" },
  { href: "/upload", label: "Data Import", shortLabel: "Import" },
  { href: "/reports", label: "Reports", shortLabel: "Reports" },
  { href: "/billing", label: "Billing", shortLabel: "Billing" },
  { href: "/account", label: "Account", shortLabel: "Account" },
  { href: "/settings", label: "Settings", shortLabel: "Settings" },
  { href: "/feedback", label: "Feedback", shortLabel: "Feedback" },
];

const adminNavigation = [{ href: "/admin", label: "Admin", shortLabel: "Admin" }];

const comingSoonNavigation = ["AI Insights", "Shopify", "Amazon"];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  email,
  isAdmin = false,
}: {
  email?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const navigation = isAdmin ? [...primaryNavigation, ...adminNavigation] : primaryNavigation;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-stone-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-stone-200 px-6 py-5">
          <Link className="text-xl font-black text-slate-950" href="/">
            FlowSync AI
          </Link>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
            Commerce Data Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <div>
            <p className="px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              Workspace
            </p>
            <div className="mt-3 grid gap-1">
              {navigation.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-teal-50 text-teal-900"
                        : "text-slate-600 hover:bg-stone-100 hover:text-slate-950"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              Later
            </p>
            <div className="mt-3 grid gap-1">
              {comingSoonNavigation.map((label) => (
                <div
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-slate-400"
                  key={label}
                >
                  <span>{label}</span>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="mb-3 rounded-md border border-teal-100 bg-teal-50 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-900">
              Free Beta
            </p>
            <p className="mt-1 text-xs leading-5 text-teal-950">
              CSV preview, Profit Preview, and Excel download are currently free.
            </p>
          </div>
          <AccountMenu email={email} fullWidth placement="top" />
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link className="text-lg font-black text-slate-950" href="/">
            FlowSync AI
          </Link>
          <AccountMenu email={email} />
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-stone-100 px-4 py-2">
          {navigation.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
                  isActive
                    ? "border-teal-200 bg-teal-50 text-teal-900"
                    : "border-stone-200 bg-white text-slate-600"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.shortLabel}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
