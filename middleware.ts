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

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("auth-token");

  if (!authCookie || authCookie.value !== "true") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/super-admin";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
