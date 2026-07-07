import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { UploadCsvClient } from "@/features/uploads/upload-csv-client";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  return <UploadCsvClient userEmail={user.email ?? "your account"} />;
}
