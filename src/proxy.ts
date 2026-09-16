import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "site_auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApi = pathname.startsWith("/api/");
  if (!isApi || pathname === "/api/login") {
    return NextResponse.next();
  }

  const authed = req.cookies.get(AUTH_COOKIE)?.value === "ok";
  if (authed) {
    return NextResponse.next();
  }

  return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
}

export const config = {
  matcher: ["/api/:path*"],
};
