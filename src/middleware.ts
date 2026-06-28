import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

/** HTTP methods that mutate state and require CSRF protection */
const CSRF_PROTECTED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Routes exempt from CSRF protection:
 * - /api/csrf itself (issues the token)
 * - /api/payments/flow-confirm (server-to-server webhook from Flow.cl)
 * - /auth/callback (Supabase OAuth callback)
 */
const CSRF_EXEMPT_PATTERNS = [
  /^\/api\/csrf$/,
  /^\/api\/payments\/flow-confirm/,
  /^\/auth\/callback/,
];

function isCSRFExempt(pathname: string): boolean {
  return CSRF_EXEMPT_PATTERNS.some((pattern) => pattern.test(pathname));
}

function validateCSRF(request: NextRequest): boolean {
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE)?.value;
  const tokenFromHeader = request.headers.get(CSRF_HEADER);

  if (!tokenFromCookie || !tokenFromHeader) return false;

  // Constant-time comparison to prevent timing attacks
  const cookieBuf = Buffer.from(tokenFromCookie);
  const headerBuf = Buffer.from(tokenFromHeader);

  if (cookieBuf.length !== headerBuf.length) return false;

  try {
    // crypto.timingSafeEqual is available in the Edge runtime via Web Crypto API.
    // We use the Node.js crypto module style since this runs on Node runtime.
    const { timingSafeEqual } = require("crypto") as typeof import("crypto");
    return timingSafeEqual(cookieBuf, headerBuf);
  } catch {
    // Fallback: plain comparison (less safe but never throws)
    return tokenFromCookie === tokenFromHeader;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF check: only for /api/* mutating requests that are not exempt
  if (
    pathname.startsWith("/api/") &&
    CSRF_PROTECTED_METHODS.has(request.method) &&
    !isCSRFExempt(pathname)
  ) {
    if (!validateCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }
  }

  // Skip Supabase if env vars are not configured yet
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    // Block dashboard without auth
    if (pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Supabase session refresh + auth-guard for /dashboard routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
