import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SITE_PHONE, SITE_ZALO_URL } from "@/lib/site";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <div id="top" className="relative overflow-hidden bg-surface-ink text-surface-ink-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
          {t("eyebrow")}
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] leading-[1.1] md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-surface-ink-foreground/75">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="highlight">
            <a href="#dang-ky">{t("ctaPrimary")}</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-surface-ink-foreground/25 bg-transparent text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:border-surface-ink-foreground/25 dark:bg-transparent dark:hover:bg-surface-ink-foreground/10"
          >
            <a href="#khoa-hoc">{t("ctaSecondary")}</a>
          </Button>
        </div>
        <div className="mt-8 flex flex-col gap-4 text-sm text-surface-ink-foreground/75 sm:flex-row">
          <a
            href={`tel:${SITE_PHONE}`}
            className="inline-flex items-center gap-2 hover:text-surface-ink-foreground hover:underline"
          >
            <Phone className="h-4 w-4" />
            {t("callNow")}
          </a>
          <a
            href={SITE_ZALO_URL}
            className="inline-flex items-center gap-2 hover:text-surface-ink-foreground hover:underline"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            {t("chatZalo")}
          </a>
        </div>
      </div>
    </div>
  );
}
