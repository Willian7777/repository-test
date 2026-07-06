import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Role, Plano } from "@/lib/constants";

function ativo(id?: string) {
  return !!id && id !== "PREENCHA";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(ativo(process.env.GOOGLE_CLIENT_ID)
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),

    // Login de usuários com conta local (email + senha)
    Credentials({
      id: "credentials",
      name: "Email e Senha",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
          include: { contaLocal: true },
        });
        if (!user || !user.contaLocal || user.deletedAt) return null;
        const ok = await bcrypt.compare(String(credentials.password), user.contaLocal.senhaHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role as Role,
          plano: user.plano as Plano,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role: Role }).role ?? "USER";
        token.plano = (user as { plano: Plano }).plano ?? "FREE";
      }
      // Atualiza plano em cada refresh (para refletir upgrade PRO)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plano: true, role: true },
        });
        if (dbUser) {
          token.plano = dbUser.plano as Plano;
          token.role  = dbUser.role as Role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id   as string;
        session.user.role  = token.role as Role;
        session.user.plano = token.plano as Plano;
      }
      return session;
    },
  },
});
