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
      tone="light"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="reveal flex h-full flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold leading-none">{plan.name}</h3>
              {/* Every figure in `plans[].price` is the centre's floor, not a flat
                  rate, so the "from" prefix is load-bearing rather than decorative —
                  dropping it turns a starting price into a promise. It is a separate
                  muted span so the number keeps the visual weight on its own. */}
              <p className="mt-2">
                <span className="text-sm text-muted-foreground">{t("from")} </span>
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
              <Button asChild variant="highlight" className="mt-auto w-full">
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
