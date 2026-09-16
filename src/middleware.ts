import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken, dashboardPathForRole } from "@/lib/auth";

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/manager": "MANAGER",
  "/rider": "RIDER",
  "/account": "CUSTOMER",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!matchedPrefix) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = ROLE_PREFIXES[matchedPrefix];
  if (session.role !== requiredRole) {
    return NextResponse.redirect(new URL(dashboardPathForRole(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/manager/:path*", "/manager", "/rider/:path*", "/rider", "/account/:path*", "/account"],
};
