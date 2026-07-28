import { z } from "zod";

/** Vietnamese mobile numbers: 0 or +84 followed by 3|5|7|8|9 and 8 digits. */
const VN_MOBILE = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const consultationSchema = z.object({
  parentName: z.string().trim().min(2, "parentName_required"),
  phone: z.string().trim().regex(VN_MOBILE, "phone_invalid"),
  grade: z.string().min(1, "grade_required"),
  subject: z.string().min(1, "subject_required"),
  format: z.string().min(1, "format_required"),
  note: z.string().max(1000, "note_too_long").optional(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
