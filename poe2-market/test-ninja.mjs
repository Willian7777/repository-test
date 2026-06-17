// Script para testar acesso ao poe.ninja com cookies de sessão
// Executar com: NODE_TLS_REJECT_UNAUTHORIZED=0 node test-ninja.mjs

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

const API_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "pt-BR,pt;q=0.9",
  "Referer": "https://poe.ninja/economy/poe2/standard",
  "Origin": "https://poe.ninja",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

console.log("1. Obtendo cookies de sessão do poe.ninja...");

// Passo 1: GET na homepage para obter cookies
const homeRes = await fetch("https://poe.ninja/", {
  headers: BROWSER_HEADERS,
  signal: AbortSignal.timeout(10000),
  redirect: "follow",
});

console.log("Homepage status:", homeRes.status);
const setCookieHeader = homeRes.headers.get("set-cookie");
console.log("Set-Cookie:", setCookieHeader?.slice(0, 200) ?? "none");

// Extrai cookies
const cookieJar = {};
if (setCookieHeader) {
  setCookieHeader.split(",").forEach(cookie => {
    const [kv] = cookie.trim().split(";");
    const [k, v] = kv.split("=");
    if (k && v) cookieJar[k.trim()] = v.trim();
  });
}
const cookieStr = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join("; ");
console.log("Cookies extraídos:", cookieStr.slice(0, 100));

// Passo 2: Testa API com cookies
console.log("\n2. Testando API com cookies de sessão...");
const leagues = ["Standard", "Runes of Aldur", "Dawn of the Hunt"];

for (const league of leagues) {
  const url = `https://poe.ninja/api/data/currencyoverview?league=${encodeURIComponent(league)}&type=Currency&language=en&game=poe2`;
  try {
    const r = await fetch(url, {
      headers: {
        ...API_HEADERS,
        ...(cookieStr ? { "Cookie": cookieStr } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });
    const text = await r.text();
    let count = 0;
    try { count = JSON.parse(text).lines?.length ?? 0; } catch {}
    console.log(`${count > 0 ? "✅" : "🔶"} [${league}] → HTTP ${r.status}, ${count} itens, ${text.length} bytes`);
  } catch (e) {
    console.log(`❌ [${league}] → ${e.message.split("\n")[0]}`);
  }
}
