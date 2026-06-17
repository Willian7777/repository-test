import type { DefaultSession } from "next-auth";

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
