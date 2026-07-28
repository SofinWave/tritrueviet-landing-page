import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consultationSchema } from "@/app/actions/consultation.schema";
import { submitConsultation } from "@/app/actions/consultation";

const valid = {
  parentName: "Nguyễn Văn A",
  phone: "0912345678",
  grade: "9",
  subject: "toan",
  format: "one-on-one",
  note: "",
};

describe("consultationSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(consultationSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a +84 phone number", () => {
    expect(consultationSchema.safeParse({ ...valid, phone: "+84912345678" }).success).toBe(true);
  });

  it("rejects a phone number that is not a Vietnamese mobile", () => {
    const result = consultationSchema.safeParse({ ...valid, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("reports validation failures as stable identifiers, not translated sentences", () => {
    const result = consultationSchema.safeParse({ ...valid, phone: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("phone_invalid");
    }
  });

  it("rejects a landline-style number starting with 02", () => {
    expect(consultationSchema.safeParse({ ...valid, phone: "0212345678" }).success).toBe(false);
  });

  it("rejects a one-character parent name", () => {
    expect(consultationSchema.safeParse({ ...valid, parentName: "A" }).success).toBe(false);
  });
});

describe("submitConsultation", () => {
  beforeEach(() => vi.spyOn(console, "log").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("returns ok for a valid submission", async () => {
    await expect(submitConsultation(valid)).resolves.toEqual({ ok: true });
  });

  it("returns the first validation message for an invalid submission", async () => {
    const result = await submitConsultation({ ...valid, phone: "nope" });
    expect(result).toEqual({ ok: false, error: "phone_invalid" });
  });

  it("does not log anything when validation fails", async () => {
    await submitConsultation({ ...valid, phone: "nope" });
    expect(console.log).not.toHaveBeenCalled();
  });
});
