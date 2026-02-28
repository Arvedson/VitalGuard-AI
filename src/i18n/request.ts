import { getRequestConfig } from "next-intl/server";
import { locales } from "../i18n.config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as any)) {
    locale = "es";
  }

  // Purely static mapping for max stability in dev
  const messages = locale === "en" 
    ? (await import("../../messages/en.json")).default
    : (await import("../../messages/es.json")).default;

  return {
    locale,
    messages
  };
});
