import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 輕量密碼門：設了環境變數 DASH_PASSWORD 才啟用（本機沒設 = 不擋，方便開發）。
// 進站帶 ?k=密碼 → 寫入 cookie；之後就免再輸入。
export function proxy(request: NextRequest) {
  const PW = process.env.DASH_PASSWORD;
  if (!PW) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  if (request.cookies.get("bk")?.value === PW) return NextResponse.next();

  const k = searchParams.get("k");
  if (k === PW) {
    const res = NextResponse.redirect(new URL(pathname, request.url));
    res.cookies.set("bk", PW, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }
  if (pathname === "/locked") return NextResponse.next();
  return NextResponse.rewrite(new URL("/locked", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
