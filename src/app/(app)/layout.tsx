import type { ReactNode } from "react";

import { getCurrentUser } from "@/features/auth/session";
import { AppSidebar } from "@/features/navigation/app-sidebar";
import { isAdminEmail } from "@/lib/admin/usageAnalytics";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await getCurrentUser();
  const isAdmin = isAdminEmail(user?.email, process.env.ADMIN_EMAIL ?? "");

  return (
    <main className="min-h-screen bg-stone-100 text-slate-900 lg:flex">
      <AppSidebar email={user?.email} isAdmin={isAdmin} />
      <div className="min-w-0 flex-1 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </main>
  );
}
