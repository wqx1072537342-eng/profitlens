import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/data-import/:path*",
    "/upload/:path*",
    "/reports/:path*",
    "/billing/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/feedback/:path*",
    "/login",
    "/signup",
  ],
};
