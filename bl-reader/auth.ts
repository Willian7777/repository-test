import NextAuth from "next-auth";
import Google   from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import GitHub   from "next-auth/providers/github";
import Discord  from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@/lib/constants";

function ativo(id?: string) {
  return !!id && id !== "PREENCHA";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google — configure GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
    ...(ativo(process.env.GOOGLE_CLIENT_ID)
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),

    // Facebook — configure FACEBOOK_CLIENT_ID + FACEBOOK_CLIENT_SECRET
    ...(ativo(process.env.FACEBOOK_CLIENT_ID)
      ? [Facebook({ clientId: process.env.FACEBOOK_CLIENT_ID!, clientSecret: process.env.FACEBOOK_CLIENT_SECRET! })]
      : []),

    // GitHub — configure GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET
    ...(ativo(process.env.GITHUB_CLIENT_ID)
      ? [GitHub({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! })]
      : []),

    // Discord — configure DISCORD_CLIENT_ID + DISCORD_CLIENT_SECRET
    ...(ativo(process.env.DISCORD_CLIENT_ID)
      ? [Discord({ clientId: process.env.DISCORD_CLIENT_ID!, clientSecret: process.env.DISCORD_CLIENT_SECRET! })]
      : []),

    // Login Admin — email/senha definidos no .env.local
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email:    { label: "Email",  type: "email"    },
        password: { label: "Senha",  type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash  = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) return null;
        if (String(credentials?.email) !== adminEmail) return null;
        if (!await bcrypt.compare(String(credentials?.password ?? ""), adminHash)) return null;

        let user = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!user) {
          user = await prisma.user.create({
            data: { email: adminEmail, name: "Administrador", role: "ADMIN" },
          });
        } else if (user.role !== "ADMIN") {
          user = await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
        }
        return { id: user.id, email: user.email!, name: user.name, role: user.role as "LEITORA" | "ADMIN" };
      },
    }),

    // Login de leitoras cadastradas no site (email + senha)
    Credentials({
      id: "leitora",
      name: "Leitora",
      credentials: {
        email:    { label: "Email", type: "email"    },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
          include: { contaLocal: true },
        });
        if (!user || !user.contaLocal || user.deletedAt) return null;
        if (!await bcrypt.compare(String(credentials.password), user.contaLocal.senhaHash)) return null;
        return { id: user.id, email: user.email!, name: user.name, role: user.role as "LEITORA" | "ADMIN" };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  pages: { signIn: "/login", error: "/acesso-negado" },
});
