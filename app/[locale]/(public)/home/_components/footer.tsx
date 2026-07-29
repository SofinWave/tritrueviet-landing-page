import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { INK_FOCUS_RING, INK_SURFACE } from "@/components/section";
import { FacebookIcon } from "@/components/facebook-icon";
import {
  SITE_FACEBOOK_HANDLE,
  SITE_FACEBOOK_URL,
  SITE_NAME,
  SITE_PHONE,
  SITE_PHONE_E164,
} from "@/lib/site";
import { cn } from "@/lib/utils";

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
    <footer className={cn("border-t border-surface-ink-foreground/15", INK_SURFACE)}>
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-surface-ink-foreground/70">{t("tagline")}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t("quickLinks")}</p>
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "rounded-sm text-sm text-surface-ink-foreground/70 hover:text-surface-ink-foreground",
                    INK_FOCUS_RING,
                  )}
                >
                  {nav(link.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t("contact")}</p>
          <ul className="space-y-2 text-sm text-surface-ink-foreground/70">
            <li>
              <a
                href={`tel:${SITE_PHONE_E164}`}
                className={cn("rounded-sm hover:text-surface-ink-foreground", INK_FOCUS_RING)}
              >
                {SITE_PHONE}
              </a>
            </li>
            <li>
              <a
                href={SITE_FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-sm hover:text-surface-ink-foreground",
                  INK_FOCUS_RING,
                )}
              >
                <FacebookIcon className="h-4 w-4 shrink-0" />
                {SITE_FACEBOOK_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* /60 chỉ đạt 4.04:1 trên --surface-ink ở dark mode — trượt AA cho
          chữ 12px thường. /70 đạt 4.94:1, /75 đạt 5.44:1. */}
      <div className="border-t border-surface-ink-foreground/15 py-6 text-center text-xs text-surface-ink-foreground/75">
        © {SITE_NAME}. {t("rights")}
      </div>
    </footer>
  );
}
