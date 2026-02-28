import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.patientId = (user as any).patientId;
        token.doctorId = (user as any).doctorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
        (session.user as any).patientId = token.patientId;
        (session.user as any).doctorId = token.doctorId;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Match /login, /en/login, /es/login, etc.
      const isAuthPage = /^\/([a-z]{2}\/)?(login|register)/.test(nextUrl.pathname);
      
      if (!isLoggedIn && !isAuthPage) {
        return false; // Redirect to login
      }
      
      if (isLoggedIn && isAuthPage) {
        // Redirect to root if already logged in but on login page
        // next-intl middleware will take care of adding the locale
        return Response.redirect(new URL("/", nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Will be added in auth.ts
} satisfies NextAuthConfig;
