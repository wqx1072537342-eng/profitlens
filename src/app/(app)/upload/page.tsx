import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { loadLatestUploadWorkspace } from "@/features/uploads/actions";
import { UploadCsvClient } from "@/features/uploads/upload-csv-client";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured) {
    redirect("/login");
  }

  const workspace = user ? await loadLatestUploadWorkspace() : null;

  return (
    <UploadCsvClient
      initialWorkspace={workspace}
      userEmail={user?.email ?? null}
    />
  );
}
