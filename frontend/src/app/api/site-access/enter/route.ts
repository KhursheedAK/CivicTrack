import { NextRequest, NextResponse } from "next/server";

// One-click access link for recruiters/clients, e.g.
//   /api/site-access/enter?key=<SITE_PASSWORD>&to=/login
// Sets the same cookie as the password form, then redirects.
export async function GET(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD;
  const { searchParams } = req.nextUrl;
  const key = searchParams.get("key");

  // Only allow same-site relative redirects (no open redirect).
  const requested = searchParams.get("to") ?? "/login";
  const to = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/login";

  if (!sitePassword || key !== sitePassword) {
    const url = req.nextUrl.clone();
    url.pathname = "/site-access/verify";
    url.search = "";
    url.searchParams.set("from", to);
    return NextResponse.redirect(url);
  }

  const dest = req.nextUrl.clone();
  dest.pathname = to.split("?")[0];
  dest.search = to.includes("?") ? `?${to.split("?").slice(1).join("?")}` : "";

  const res = NextResponse.redirect(dest);
  res.cookies.set("site_access", sitePassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
