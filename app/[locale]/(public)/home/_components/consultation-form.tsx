"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitConsultation } from "@/app/actions/consultation";
import { CONSULTATION_FORM_ENABLED } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "failed"; error: string };

/**
 * `disabled` defaults to the `CONSULTATION_FORM_ENABLED` switch in `lib/site.ts`
 * rather than reading it inline, so the tests can still drive a live form with
 * `disabled={false}`. That keeps every submit/success/failure path covered while
 * the shipped default is off — the coverage does not go stale waiting for the
 * form to come back.
 */
export function ConsultationForm({
  disabled = !CONSULTATION_FORM_ENABLED,
}: {
  disabled?: boolean;
}) {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function translateError(errorId: string): string {
    const key = `errors.${errorId}`;
    return t.has(key) ? t(key) : t("error");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The controls are disabled, so this should be unreachable — it is here so
    // that a submit triggered any other way still cannot create a lead.
    if (disabled) return;
    // Captured before the `await` — `event.currentTarget` is nulled out by
    // React once the synthetic event is done dispatching, so it cannot be
    // read after an async gap.
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setStatus({ kind: "sending" });

    try {
      const result = await submitConsultation({
        parentName: String(form.get("parentName") ?? ""),
        phone: String(form.get("phone") ?? ""),
        grade: String(form.get("grade") ?? ""),
        subject: String(form.get("subject") ?? ""),
        format: String(form.get("format") ?? ""),
        note: String(form.get("note") ?? ""),
      });

      if (result.ok) {
        // Clear the submitted values so the live submit button under the
        // success message can't be clicked again to create a duplicate lead.
        formEl.reset();
        setStatus({ kind: "sent" });
      } else {
        setStatus({ kind: "failed", error: translateError(result.error) });
      }
    } catch {
      setStatus({ kind: "failed", error: t("error") });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Sits first inside the form so a screen reader reaches the explanation
          before it reaches the six dead controls. Plain <p>, not role="status":
          this is present on load rather than announced on change, and every
          route into this section (#dang-ky from the header, the hero and all
          three pricing CTAs) lands a visitor here expecting to type. */}
      {disabled ? (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("disabledNotice")}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parentName">{t("parentName")}</Label>
          <Input id="parentName" name="parentName" required disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" inputMode="tel" required disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">{t("grade")}</Label>
          <Input
            id="grade"
            name="grade"
            placeholder={t("gradePlaceholder")}
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">{t("subject")}</Label>
          <Input
            id="subject"
            name="subject"
            placeholder={t("subjectPlaceholder")}
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="format">{t("format")}</Label>
          <Input
            id="format"
            name="format"
            placeholder={t("formatPlaceholder")}
            required
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">{t("note")}</Label>
        <Textarea
          id="note"
          name="note"
          rows={4}
          placeholder={t("notePlaceholder")}
          disabled={disabled}
        />
      </div>

      <Button
        type="submit"
        variant="highlight"
        className="w-full"
        disabled={disabled || status.kind === "sending"}
      >
        {status.kind === "sending" ? t("submitting") : t("submit")}
      </Button>

      {/* The brand red (hue 28.0) and --destructive (hue 27.3) are 0.7 degrees apart,
          so colour alone can no longer tell "confirmed" from "failed" — WCAG 1.4.1.
          The icon and the tinted block carry the meaning; the colour only reinforces it. */}
      {status.kind === "sent" ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md bg-secondary p-3 text-sm font-medium text-foreground"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t("success")}
        </p>
      ) : null}
      {status.kind === "failed" ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {status.error}
        </p>
      ) : null}
    </form>
  );
}
