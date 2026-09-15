import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password: string | undefined = body?.password;
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "사이트 비밀번호가 설정되어 있지 않습니다. 관리자에게 문의해주세요." },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("site_auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
  return res;
}
