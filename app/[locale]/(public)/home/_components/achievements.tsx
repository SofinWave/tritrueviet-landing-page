import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Achievement = { title: string; detail: string };

export function Achievements() {
  const t = useTranslations("achievements");
  const items = t.raw("items") as Achievement[];

  return (
    <Section
      id="thanh-tich"
      tone="ink"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Card
            key={`achievement-${index}`}
            className="reveal h-full border-surface-ink-foreground/15 bg-surface-ink-foreground/5 text-surface-ink-foreground"
          >
            <CardHeader>
              <Trophy className="mb-2 h-6 w-6 text-highlight" aria-hidden="true" />
              <h3 className="text-lg font-semibold leading-none">{item.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-ink-foreground/70">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
