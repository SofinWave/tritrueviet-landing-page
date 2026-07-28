import { useTranslations } from "next-intl";

const KEYS = ["students", "years", "passRate", "teachers"] as const;

export function Stats() {
  const t = useTranslations("stats");

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        {KEYS.map((key) => (
          <div key={key} className="text-center">
            <p className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              {t(`${key}.value`)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t(`${key}.label`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
