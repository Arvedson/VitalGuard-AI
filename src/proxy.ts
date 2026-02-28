import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n.config";

export const proxy = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
  
  localePrefix: "always"
});

export const config = {
  // Match all pathnames except those starting with:
  // - api (API routes)
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - all files with an extension (e.g. favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
