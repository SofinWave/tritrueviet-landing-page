import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { ConsultationForm } from "@/app/[locale]/(public)/home/_components/consultation-form";

const submitConsultation = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/consultation", () => ({ submitConsultation }));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <ConsultationForm />
    </NextIntlClientProvider>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Họ tên phụ huynh"), "Nguyễn Văn A");
  await user.type(screen.getByLabelText("Số điện thoại"), "0912345678");
  await user.type(screen.getByLabelText("Lớp"), "9");
  await user.type(screen.getByLabelText("Môn quan tâm"), "Toán");
  await user.type(screen.getByLabelText("Hình thức học"), "1 kèm 1");
}

describe("ConsultationForm", () => {
  beforeEach(() => submitConsultation.mockReset());

  it("labels every required field", () => {
    renderForm();
    for (const label of [
      "Họ tên phụ huynh",
      "Số điện thoại",
      "Lớp",
      "Môn quan tâm",
      "Hình thức học",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("sends the typed values to the server action", async () => {
    submitConsultation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(submitConsultation).toHaveBeenCalledWith(
      expect.objectContaining({ parentName: "Nguyễn Văn A", phone: "0912345678", grade: "9" }),
    );
  });

  it("shows the success message after a successful submission", async () => {
    submitConsultation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Đã nhận thông tin");
  });

  it("surfaces the error returned by the action", async () => {
    submitConsultation.mockResolvedValue({ ok: false, error: "Số điện thoại không hợp lệ" });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Số điện thoại không hợp lệ");
  });
});
