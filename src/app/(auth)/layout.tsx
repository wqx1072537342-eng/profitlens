import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-stone-100 px-5 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section className="grid gap-5">
          <Link className="text-sm font-bold uppercase tracking-wide text-teal-800" href="/">
            FlowSync AI
          </Link>
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              AI Commerce Data Automation Platform
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              Turn marketplace CSV files into accounting-ready records.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Create an account to save CSV analyses, generate reports, and return
              to your commerce data automation workspace.
            </p>
          </div>
        </section>
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          {children}
        </section>
      </div>
    </main>
  );
}
