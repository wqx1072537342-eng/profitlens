import Link from "next/link";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link className="font-black text-slate-950" href="/">
            ProfitLens
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <Link className="text-teal-800 hover:text-teal-900" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </main>
  );
}

