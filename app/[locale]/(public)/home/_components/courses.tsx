import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CourseItem = { name: string; description: string; grades: string };

export function Courses() {
  const t = useTranslations("courses");
  const items = t.raw("items") as CourseItem[];

  return (
    <Section
      id="khoa-hoc"
      tone="light"
      align="start"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.name} className="reveal h-full">
            <CardHeader>
              <h3 className="text-lg font-semibold leading-none">{item.name}</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {item.grades}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
