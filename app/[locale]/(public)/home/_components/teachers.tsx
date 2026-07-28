import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Teacher = { name: string; subject: string; credential: string };

export function Teachers() {
  const t = useTranslations("teachers");
  const items = t.raw("items") as Teacher[];

  return (
    <Section
      id="giao-vien"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-muted/30"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((teacher, index) => (
          <Card key={`teacher-${index}`} className="h-full text-center">
            <CardHeader>
              <div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary"
                aria-hidden="true"
              >
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold leading-none">{teacher.name}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-primary">{teacher.subject}</p>
              <p className="mt-2 text-sm text-muted-foreground">{teacher.credential}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
