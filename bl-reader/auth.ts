import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // Adiciona id e role do banco na sessão JWT
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { id: string; role: Role }).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/acesso-negado",
  },
  // Sessão via banco de dados (não JWT) — mais seguro para dados sensíveis
  session: { strategy: "database" },
});
