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
  "/api/",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p) || pathname === p)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("auth-token");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
