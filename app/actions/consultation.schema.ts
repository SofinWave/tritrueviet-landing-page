import { z } from "zod";

/** Vietnamese mobile numbers: 0 or +84 followed by 3|5|7|8|9 and 8 digits. */
const VN_MOBILE = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const consultationSchema = z.object({
  parentName: z.string().trim().min(2, "Vui lòng nhập họ tên phụ huynh"),
  phone: z.string().trim().regex(VN_MOBILE, "Số điện thoại không hợp lệ"),
  grade: z.string().min(1, "Vui lòng chọn lớp"),
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  format: z.string().min(1, "Vui lòng chọn hình thức học"),
  note: z.string().max(1000, "Ghi chú quá dài").optional(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
