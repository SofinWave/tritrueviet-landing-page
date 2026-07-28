import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("container mx-auto px-4 py-16 md:py-24", className)}>
      {title ? (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          {description ? <p className="mt-4 text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
