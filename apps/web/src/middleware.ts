import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/register", "/public"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas: no requieren auth
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/api") ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublic) return NextResponse.next();

  // Verificar access token en cookies
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protege todas las rutas excepto archivos estáticos y API internas
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
