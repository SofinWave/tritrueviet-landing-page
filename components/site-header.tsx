import { Menu, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <header className="sticky top-0 z-50 w-full bg-surface-ink text-surface-ink-foreground">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <a href="#top" className="mr-auto">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-surface-ink-foreground/70 hover:text-surface-ink-foreground"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("openMenu")}
                className="text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:hover:bg-surface-ink-foreground/10 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {NAV_ITEMS.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <a href={item.href}>{t(item.key)}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <LanguageSwitcher />
          <ModeToggle />
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={t("callHotline")}
            className="text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:hover:bg-surface-ink-foreground/10"
          >
            <a href={`tel:${SITE_PHONE}`}>
              <Phone className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild size="sm" variant="highlight" className="ml-1">
            <a href="#dang-ky">{t("register")}</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
