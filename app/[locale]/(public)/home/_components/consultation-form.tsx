"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitConsultation } from "@/app/actions/consultation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "failed"; error: string };

export function ConsultationForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function translateError(errorId: string): string {
    const key = `errors.${errorId}`;
    return t.has(key) ? t(key) : t("error");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parentName">{t("parentName")}</Label>
          <Input id="parentName" name="parentName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" inputMode="tel" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">{t("grade")}</Label>
          <Input id="grade" name="grade" placeholder={t("gradePlaceholder")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">{t("subject")}</Label>
          <Input id="subject" name="subject" placeholder={t("subjectPlaceholder")} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="format">{t("format")}</Label>
          <Input id="format" name="format" placeholder={t("formatPlaceholder")} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">{t("note")}</Label>
        <Textarea id="note" name="note" rows={4} placeholder={t("notePlaceholder")} />
      </div>

      <Button
        type="submit"
        variant="highlight"
        className="w-full"
        disabled={status.kind === "sending"}
      >
        {status.kind === "sending" ? t("submitting") : t("submit")}
      </Button>

      {status.kind === "sent" ? (
        <p role="status" className="text-sm font-medium text-primary">
          {t("success")}
        </p>
      ) : null}
      {status.kind === "failed" ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {status.error}
        </p>
      ) : null}
    </form>
  );
}
