import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.resolvepramin.app",
  appName: "Resolve Pra Mim",

  // O app carrega o conteúdo a partir da URL do servidor Next.js (Vercel).
  // Não precisa exportar como estático — API routes e SSR funcionam normalmente.
  webDir: "public", // pasta existente; ignorada quando server.url está ativo

  server: {
    // ── Produção: altere para a URL da Vercel antes de publicar nas lojas ──
    url: "https://resolve-pra-mim.vercel.app",
    cleartext: false,
    androidScheme: "https",

    // ── Dev local: substitua pelo IP da sua máquina na rede Wi-Fi ──────────
    // url: "http://192.168.0.X:3000",
    // cleartext: true,
  },

  plugins: {
    // Tela de splash ao abrir o app
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#1E3A8A",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Barra de status do sistema
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1E3A8A",
      overlaysWebView: false,
    },
    // Câmera nativa
    Camera: {
      quality: 90,
    },
    // Notificações locais (alertas de prazo)
    LocalNotifications: {
      smallIcon: "ic_stat_resolvio",
      iconColor: "#2563EB",
      sound: "beep.wav",
    },
  },

  ios: {
    backgroundColor: "#1E3A8A",
    allowsLinkPreview: false,
    contentInset: "automatic",
    preferredContentMode: "mobile",
    limitsNavigationsToAppBoundDomains: true,
    appendUserAgent: "ResolvePraMim-iOS",
  },

  android: {
    backgroundColor: "#1E3A8A",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: "ResolvePraMim-Android",
  },
};

export default config;
