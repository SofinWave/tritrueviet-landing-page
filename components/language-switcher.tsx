"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSupport } from "@/enums";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LABELS: Record<string, string> = {
  [LocaleSupport.VI]: "Tiếng Việt",
  [LocaleSupport.EN]: "English",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("switchLanguage")}
          className="text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:hover:bg-surface-ink-foreground/10"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(LocaleSupport).map((l) => (
          <DropdownMenuItem
            key={l}
            disabled={l === locale}
            onSelect={() => router.replace(pathname, { locale: l })}
          >
            {LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
