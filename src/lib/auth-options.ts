import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { Role } from "./types";

type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  line?: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "user-viewer",
    name: "Viewer Violet",
    email: "viewer@example.com",
    password: "viewer123",
    role: "viewer",
  },
  {
    id: "user-qa",
    name: "QA Quinn",
    email: "qa@example.com",
    password: "qa123456",
    role: "qa_engineer",
    line: "L1",
  },
  {
    id: "user-admin",
    name: "Admin Avery",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
];

function sanitizeUser(user: MockUser): User & { role: Role } {
  const { password: _password, ...rest } = user;
  void _password;
  return rest;
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = mockUsers.find(
          (entry) =>
            entry.email === credentials.email &&
            entry.password === credentials.password,
        );

        if (!user) {
          return null;
        }

        return sanitizeUser(user);
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as MockUser).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = (token.role ?? "viewer") as Role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
};
