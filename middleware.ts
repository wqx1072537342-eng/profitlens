import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { canonicalRedirectUrl } from "@/lib/domain/canonicalRedirect";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const redirectUrl = canonicalRedirectUrl(request.url);

  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl, 301);
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
