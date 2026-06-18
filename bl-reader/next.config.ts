import type { NextConfig } from "next";

// Proxy SSL corporativo — desabilita verificação apenas em dev local (igual ao poe2-market)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Content-Security-Policy — ajuste src se adicionar CDNs/fontes externas
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.supabase.co",
  "connect-src 'self' https://api.mercadopago.com https://*.cognitiveservices.azure.com https://api.cognitive.microsofttranslator.com",
  "frame-src https://www.mercadopago.com.br https://www.mercadopago.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  // HSTS: força HTTPS em produção (não ativar em dev — pode quebrar localhost)
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // Avatares do Google OAuth
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Imagens no Supabase Storage (capas e páginas das HQs)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
