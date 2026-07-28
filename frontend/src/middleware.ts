import { type NextRequest, NextResponse } from "next/server";

function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    // Edge runtime supports atob
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { role?: string; exp?: number };
  } catch {
    return null;
  }
}

function isTokenExpired(payload: { exp?: number }): boolean {
  if (!payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

const PUBLIC_PATHS = ["/", "/track", "/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/privacy", "/terms", "/support"];
const ROLE_PREFIXES: Record<string, string[]> = {
  CITIZEN: ["/dashboard", "/complaints", "/complaint", "/notifications", "/settings"],
  OFFICER: ["/officer"],
  ADMIN: ["/admin"],
};
const ROLE_HOME: Record<string, string> = {
  CITIZEN: "/dashboard",
  OFFICER: "/officer/dashboard",
  ADMIN: "/admin/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // If already authenticated, redirect away from login/register
    if (pathname === "/login" || pathname === "/register") {
      const token = request.cookies.get("access_token")?.value;
      if (token) {
        const payload = decodeJwtPayload(token);
        if (payload && !isTokenExpired(payload) && payload.role) {
          return NextResponse.redirect(new URL(ROLE_HOME[payload.role] ?? "/", request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Protected routes — check token
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const payload = decodeJwtPayload(token);

  if (!payload || isTokenExpired(payload)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete("access_token");
    return response;
  }

  const role = payload.role as string | undefined;
  if (!role) return NextResponse.redirect(new URL("/login", request.url));

  // Check role-based access
  const allowedPrefixes = ROLE_PREFIXES[role] ?? [];
  const allowed = allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));

  if (!allowed) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
