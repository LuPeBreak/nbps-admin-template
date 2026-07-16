import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

const AUTH_ROUTES = ["/sign-in", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = ["/", "/verify-email-success"];

async function getSessionFromRequest(request: NextRequest) {
  try {
    const headers = new Headers();
    headers.set("cookie", request.headers.get("cookie") ?? "");
    return await auth.api.getSession({ headers });
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/auth");

  // Em rotas de auth, checa sessão só pra redirecionar pro dashboard se já logado
  if (isAuthRoute) {
    const session = await getSessionFromRequest(request);
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Rotas públicas: sempre permite
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Rotas privadas: exige sessão válida (validação real no DB, não só cookie)
  const session = await getSessionFromRequest(request);
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next|favicon.ico|static).*)"],
};
