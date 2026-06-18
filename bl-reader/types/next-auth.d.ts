import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "LEITORA" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "LEITORA" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: "LEITORA" | "ADMIN";
  }
}
