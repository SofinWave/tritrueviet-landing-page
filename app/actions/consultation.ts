"use server";

import { consultationSchema, type ConsultationInput } from "./consultation.schema";

export async function submitConsultation(
  data: ConsultationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = consultationSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  // Deliberately unintegrated — see the design spec. Wire a webhook, Google
  // Sheet or email provider here when the centre picks one.
  console.log("[consultation] submission", parsed.data);
  return { ok: true };
}
