import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Plan = { name: string; price: string; features: string[] };

export function Pricing() {
  const t = useTranslations("pricing");
  const plans = t.raw("plans") as Plan[];

  return (
    <Section
      id="hoc-phi"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-muted/30"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex h-full flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold leading-none">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-2xl font-bold">{plan.price}</span>{" "}
                <span className="text-sm text-muted-foreground">{t("perSession")}</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-auto w-full">
                <a href="#dang-ky">{t("cta")}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">{t("note")}</p>
    </Section>
  );
}
