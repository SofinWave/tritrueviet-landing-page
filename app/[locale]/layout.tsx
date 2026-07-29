import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import {
  OG_LOCALE,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_SHORT_NAME,
  SITE_THEME_COLOR,
  SITE_URL,
  languageAlternates,
  localeUrl,
} from "@/lib/site";
import "../globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Paints the mobile browser chrome in the brand red so the address bar matches
 * the header sitting directly under it. Shares `SITE_THEME_COLOR` with
 * `app/manifest.ts` — a PWA whose manifest and meta tag disagree flashes the
 * wrong colour on launch.
 */
export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
  colorScheme: "light dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("title");
  const description = t("description");
  const url = localeUrl(locale);

  // `metadataBase` is set below, so a root-relative path is resolved to an
  // absolute one by Next — crawlers reject relative og:image URLs.
  const images = [
    {
      url: SITE_OG_IMAGE.path,
      width: SITE_OG_IMAGE.width,
      height: SITE_OG_IMAGE.height,
      type: SITE_OG_IMAGE.type,
      alt: t("ogImageAlt"),
    },
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      // Sub-pages get "<their title> | Trí Tuệ Việt" without restating the
      // full legal name, which would blow past the ~60 char SERP cut-off.
      template: `%s | ${SITE_SHORT_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: SITE_KEYWORDS[locale] ?? SITE_KEYWORDS[routing.defaultLocale],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(routing.locales),
        "x-default": localeUrl(routing.defaultLocale),
      },
      // Advertises the machine-readable copy of this page so an answer engine
      // can find /llms.txt from the HTML instead of only by probing the path.
      types: { "text/markdown": `${SITE_URL}/llms.txt` },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${sans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
