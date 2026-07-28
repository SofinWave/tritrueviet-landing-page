import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SITE_PHONE, SITE_ZALO_URL } from "@/lib/site";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <div id="top" className="relative overflow-hidden border-b bg-muted/30">
      <div className="container relative z-10 mx-auto px-4 py-20 text-center md:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="#dang-ky">{t("ctaPrimary")}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#khoa-hoc">{t("ctaSecondary")}</a>
          </Button>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
          <a href={`tel:${SITE_PHONE}`} className="inline-flex items-center gap-2 hover:underline">
            <Phone className="h-4 w-4" />
            {t("callNow")}
          </a>
          <a
            href={SITE_ZALO_URL}
            className="inline-flex items-center gap-2 hover:underline"
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
