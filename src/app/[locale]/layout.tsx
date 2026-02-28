import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n.config";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextAuthProvider } from "@/components/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.className} antialiased selection:bg-primary/20 selection:text-primary`}>
        <NextIntlClientProvider messages={messages}>
          <NextAuthProvider>
            {children}
            <Toaster closeButton position="top-right" richColors />
          </NextAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
