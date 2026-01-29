import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("football_intel_session");
  const { pathname } = request.nextUrl;

  if (
    !session &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
