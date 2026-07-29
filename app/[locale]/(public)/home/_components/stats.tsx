import { useTranslations } from "next-intl";
import { INK_SURFACE } from "@/components/section";

const KEYS = ["students", "years", "tutors", "teachers"] as const;

export function Stats() {
  const t = useTranslations("stats");

  return (
    <div className={INK_SURFACE}>
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 pb-16 md:grid-cols-4 md:pb-24">
        {KEYS.map((key) => (
          <div key={key} className="reveal border-t border-surface-ink-foreground/15 pt-4">
            <p className="text-3xl font-extrabold tracking-[-0.03em] text-highlight md:text-4xl">
              {t(`${key}.value`)}
            </p>
            <p className="mt-2 text-sm text-surface-ink-foreground/70">{t(`${key}.label`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
