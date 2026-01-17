import { NextResponse } from "next/server";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "psikolog_admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;

  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "Server misconfigured: ADMIN_PASSWORD missing" },
      { status: 500 }
    );
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "Kullanıcı adı veya şifre hatalı" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
