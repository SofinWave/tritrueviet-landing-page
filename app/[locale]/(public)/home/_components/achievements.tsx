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
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={`achievement-${index}`} className="h-full">
            <CardHeader>
              <Trophy className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-semibold leading-none">{item.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
