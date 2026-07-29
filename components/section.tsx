import { cn } from "@/lib/utils";

/**
 * Công thức nền ink, định nghĩa MỘT lần. `tone="ink"` phủ 9/13 bề mặt ink;
 * bốn chỗ còn lại (hero, stats, footer, site-header) không phải `Section`
 * nên phải nhập hằng này thay vì chép lại chuỗi.
 */
export const INK_SURFACE = "bg-surface-ink text-surface-ink-foreground";

/**
 * Vòng focus đọc được trên nền ink. `ring-ring/50` mặc định của shadcn chỉ
 * đạt 1.54:1 trên `--surface-ink` ở light mode — dưới ngưỡng 3:1 của
 * SC 1.4.11. Dùng cho mọi phần tử tương tác nằm trên bề mặt ink mà không
 * phải `Button` (Button đã có variant `ink-ghost`).
 */
export const INK_FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-surface-ink-foreground/60";

const TONES = {
  light: "bg-background text-foreground",
  muted: "bg-muted/40 text-foreground",
  ink: INK_SURFACE,
} as const;

export type SectionTone = keyof typeof TONES;

export function Section({
  id,
  className,
  eyebrow,
  title,
  description,
  tone = "light",
  align = "center",
  children,
}: {
  id?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: SectionTone;
  align?: "center" | "start";
  children: React.ReactNode;
}) {
  const isInk = tone === "ink";

  return (
    <section id={id} data-tone={tone} className={cn(TONES[tone], className)}>
      <div className="container mx-auto px-4 py-16 md:py-24">
        {title ? (
          <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center")}>
            {eyebrow ? (
              <p
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-[0.2em]",
                  isInk ? "text-highlight" : "text-primary",
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] leading-[1.1] md:text-4xl">
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-4",
                  isInk ? "text-surface-ink-foreground/75" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
