import { Home, Monitor, type LucideIcon, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type FormatItem = { name: string; description: string; icon: string };

// Exported so tests can assert every `formats.items[].icon` value in both
// message catalogs is a key here — otherwise a typo (or a rename in one
// locale only) falls through to the `?? User` fallback below silently.
export const ICONS: Record<string, LucideIcon> = {
  "one-on-one": User,
  "small-group": Users,
  online: Monitor,
  home: Home,
};

export function Formats() {
  const t = useTranslations("formats");
  const items = t.raw("items") as FormatItem[];

  return (
    <Section
      id="hinh-thuc"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-muted/30"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? User;
          return (
            <Card key={item.name} className="h-full">
              <CardHeader>
                <Icon className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-semibold leading-none">{item.name}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
