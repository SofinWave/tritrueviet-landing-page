import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

type Step = { title: string; description: string };

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];

  return (
    <Section
      id="quy-trinh"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative border-t-2 border-primary/30 pt-6">
            <span className="text-sm font-bold tracking-widest text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
