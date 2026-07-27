import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/super-admin",
  "/company-login",
  "/franchise-admin",
  "/dsm-login",
  "/dso-login",
  "/_next/static",
  "/_next/image",
  "/api/auth/session-check",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  try {
    const baseUrl = request.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/auth/session-check`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (!data.authenticated) {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
