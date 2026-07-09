"use client";

import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/features/auth/actions";

export function AccountMenu({ email }: { email?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountLabel = email ? email.split("@")[0] : "Account";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex max-w-[220px] items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{accountLabel}</span>
        <span aria-hidden="true" className="text-xs text-slate-500">
          v
        </span>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg"
          role="menu"
        >
          <div className="border-b border-stone-200 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {email ?? "Account"}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              role="menuitem"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
