import "server-only";
import NextAuth from "next-auth";
import { authConfig } from "./config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}
