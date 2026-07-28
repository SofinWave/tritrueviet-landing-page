import { z } from "zod";

/** Vietnamese mobile numbers: 0 or +84 followed by 3|5|7|8|9 and 8 digits. */
const VN_MOBILE = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const consultationSchema = z.object({
  parentName: z.string().trim().min(2, "parentName_required").max(100, "parentName_too_long"),
  phone: z.string().trim().regex(VN_MOBILE, "phone_invalid"),
  grade: z.string().min(1, "grade_required").max(50, "grade_too_long"),
  subject: z.string().min(1, "subject_required").max(50, "subject_too_long"),
  format: z.string().min(1, "format_required").max(50, "format_too_long"),
  note: z.string().max(1000, "note_too_long").optional(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
