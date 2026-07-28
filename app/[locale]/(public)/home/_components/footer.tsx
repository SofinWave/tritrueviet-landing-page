import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@/lib/site";

const LINKS = [
  { href: "#khoa-hoc", key: "courses" },
  { href: "#hinh-thuc", key: "formats" },
  { href: "#giao-vien", key: "teachers" },
  { href: "#hoc-phi", key: "pricing" },
  { href: "#dang-ky", key: "register" },
] as const;

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t("quickLinks")}</p>
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {nav(link.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t("contact")}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`tel:${SITE_PHONE}`} className="hover:text-foreground">
                {SITE_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE_EMAIL}`} className="hover:text-foreground">
                {SITE_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {SITE_NAME}. {t("rights")}
      </div>
    </footer>
  );
}
