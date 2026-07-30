import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.has("Authorization");
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
