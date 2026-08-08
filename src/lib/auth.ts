import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais inválidas");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Senha incorreta");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Evitar HTTP 431: Remove a imagem do JWT se for um Base64 grande (NextAuth chama de 'picture' internamente)
      if (token.picture && token.picture.startsWith('data:image')) {
        delete token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // @ts-ignore
        session.user.id = token.id;

        // Puxa a imagem atualizada do banco para evitar guardar no cookie
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { image: true }
          });
          if (dbUser?.image) {
            session.user.image = dbUser.image;
          }
        } catch (error) {
          console.error("Erro ao puxar imagem na sessão", error);
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
