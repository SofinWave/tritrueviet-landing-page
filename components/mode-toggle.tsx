"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("nav");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggleTheme")}
      className="text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:hover:bg-surface-ink-foreground/10"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  );
}
