import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { INK_FOCUS_RING, Section } from "@/components/section";
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE, SITE_ZALO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ConsultationForm } from "./consultation-form";

export function Contact() {
  const t = useTranslations("contact");
  const address = [SITE_ADDRESS.street, SITE_ADDRESS.district, SITE_ADDRESS.city].join(", ");

  const details = [
    { icon: Phone, label: t("phoneLabel"), value: SITE_PHONE, href: `tel:${SITE_PHONE}` },
    { icon: MessageCircle, label: t("zaloLabel"), value: SITE_ZALO_URL, href: SITE_ZALO_URL },
    { icon: Mail, label: t("emailLabel"), value: SITE_EMAIL, href: `mailto:${SITE_EMAIL}` },
    { icon: MapPin, label: t("addressLabel"), value: address, href: undefined },
  ];

  return (
    <Section
      id="dang-ky"
      tone="ink"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <ul className="space-y-6">
          {details.map((detail) => (
            <li key={detail.label} className="flex gap-3">
              <detail.icon className="mt-1 h-5 w-5 shrink-0 text-highlight" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{detail.label}</p>
                {detail.href ? (
                  <a
                    href={detail.href}
                    className={cn(
                      "rounded-sm text-sm text-surface-ink-foreground/70 hover:text-surface-ink-foreground hover:underline",
                      INK_FOCUS_RING,
                    )}
                  >
                    {detail.value}
                  </a>
                ) : (
                  <p className="text-sm text-surface-ink-foreground/70">{detail.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <ConsultationForm />
      </div>
    </Section>
  );
}
