import { MapPin, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon } from "@/components/facebook-icon";
import { useTranslations } from "next-intl";
import { INK_FOCUS_RING, Section } from "@/components/section";
import {
  SITE_ADDRESS,
  SITE_FACEBOOK_URL,
  SITE_PHONE,
  SITE_PHONE_E164,
  SITE_ZALO_URL,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import { ConsultationForm } from "./consultation-form";

/** A bare URL reads as noise in a contact list; the scheme carries nothing. */
const stripScheme = (url: string) => url.replace(/^https?:\/\//, "");

/**
 * Zalo and Facebook leave the site, so they open in a new tab — a visitor part
 * way through the consultation form should not lose it to a chat window. `tel:`
 * must NOT get the same treatment: on desktop it would leave a blank tab behind
 * after handing off to the dialler.
 */
const isExternal = (href: string) => href.startsWith("http");

export function Contact() {
  const t = useTranslations("contact");
  const address = [SITE_ADDRESS.street, SITE_ADDRESS.district, SITE_ADDRESS.city].join(", ");

  // Shown grouped, dialled in E.164 — see the note on SITE_PHONE.
  const details = [
    { icon: Phone, label: t("phoneLabel"), value: SITE_PHONE, href: `tel:${SITE_PHONE_E164}` },
    {
      icon: MessageCircle,
      label: t("zaloLabel"),
      value: stripScheme(SITE_ZALO_URL),
      href: SITE_ZALO_URL,
    },
    {
      icon: FacebookIcon,
      label: t("facebookLabel"),
      value: stripScheme(SITE_FACEBOOK_URL),
      href: SITE_FACEBOOK_URL,
    },
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
                    target={isExternal(detail.href) ? "_blank" : undefined}
                    rel={isExternal(detail.href) ? "noreferrer" : undefined}
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
        {/* Form phải nổi trên một tấm nền sáng, không đặt trần lên dải ink.
            Đo trên --surface-ink thì thông báo thành công (text-primary) chỉ
            đạt 2.96:1 / 2.35:1, thông báo lỗi (text-destructive) 4.23:1 /
            3.06:1, placeholder 4.23:1 / 3.36:1 và nút gửi 2.96:1 / 2.35:1 —
            cả bốn đều trượt AA. Tấm bg-card này khôi phục đúng bề mặt mà các
            token đó được thiết kế để nằm trên. Đừng gỡ nó ra. */}
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <ConsultationForm />
        </div>
      </div>
    </Section>
  );
}
