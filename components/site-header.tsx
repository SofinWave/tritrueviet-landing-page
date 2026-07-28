import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { SITE_PHONE } from "@/lib/site";

const NAV_ITEMS = [
  { href: "#khoa-hoc", key: "courses" },
  { href: "#hinh-thuc", key: "formats" },
  { href: "#giao-vien", key: "teachers" },
  { href: "#hoc-phi", key: "pricing" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <a href="#top" className="mr-auto">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild variant="ghost" size="icon" aria-label={SITE_PHONE}>
            <a href={`tel:${SITE_PHONE}`}>
              <Phone className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild size="sm" className="ml-1">
            <a href="#dang-ky">{t("register")}</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
