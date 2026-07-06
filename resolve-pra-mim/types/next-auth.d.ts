import type { Role, Plano } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      plano: Plano;
    };
  }

  interface User {
    role?: Role;
    plano?: Plano;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    plano?: Plano;
  }
}
