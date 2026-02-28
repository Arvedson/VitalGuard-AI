export const locales = ["en", "es"] as const;
export const defaultLocale = "es" as const;

export type Locale = (typeof locales)[number];
