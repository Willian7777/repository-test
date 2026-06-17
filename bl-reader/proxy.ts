import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Rate limiter in-memory por IP (simples, sem dependências externas)
// Para produção com múltiplas instâncias, use Redis/Upstash
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= maxPerMinute) return true;
  entry.count++;
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // ── Rate limiting em rotas sensíveis ─────────────────────────────────────
  if (
    pathname.startsWith("/api/pagamentos") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/usuario")
  ) {
    if (isRateLimited(ip, 20)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Content-Type": "text/plain",
        },
      });
    }
  }

  // ── Rotas Admin: exige role ADMIN ──────────────────────────────────────────
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/acesso-negado", req.url));
    }
  }

  // ── Rotas que exigem autenticação ─────────────────────────────────────────
  if (
    pathname.startsWith("/biblioteca") ||
    pathname.startsWith("/conta") ||
    pathname.match(/^\/obras\/[^/]+\/ler/)
  ) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/pagamentos/:path*",
    "/api/auth/:path*",
    "/api/usuario/:path*",
    "/biblioteca/:path*",
    "/conta/:path*",
    "/obras/:path*/ler/:path*",
  ],
};
