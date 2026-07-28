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

  it("rejects a parent name over 100 characters as parentName_too_long", () => {
    const result = consultationSchema.safeParse({ ...valid, parentName: "A".repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("parentName_too_long");
    }
  });

  it("accepts a parent name at exactly 100 characters", () => {
    expect(consultationSchema.safeParse({ ...valid, parentName: "A".repeat(100) }).success).toBe(
      true,
    );
  });

  it("rejects a grade over 50 characters as grade_too_long", () => {
    const result = consultationSchema.safeParse({ ...valid, grade: "A".repeat(51) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("grade_too_long");
    }
  });

  it("rejects a subject over 50 characters as subject_too_long", () => {
    const result = consultationSchema.safeParse({ ...valid, subject: "A".repeat(51) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("subject_too_long");
    }
  });

  it("rejects a format over 50 characters as format_too_long", () => {
    const result = consultationSchema.safeParse({ ...valid, format: "A".repeat(51) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("format_too_long");
    }
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
