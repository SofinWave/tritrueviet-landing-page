import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = { quote: string; author: string; role: string };

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Testimonial[];

  return (
    <Section id="cam-nhan" eyebrow={t("eyebrow")} title={t("title")}>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={`testimonial-${index}`} className="h-full">
            <CardContent className="pt-6">
              <Quote className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
              <blockquote className="text-sm leading-relaxed">{item.quote}</blockquote>
              <footer className="mt-4">
                <p className="text-sm font-semibold">{item.author}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </footer>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
