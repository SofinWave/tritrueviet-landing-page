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
  beforeEach(() => vi.clearAllMocks());

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

    expect(submitConsultation).toHaveBeenCalledWith({
      parentName: "Nguyễn Văn A",
      phone: "0912345678",
      grade: "9",
      subject: "Toán",
      format: "1 kèm 1",
      note: "",
    });
  });

  it("shows the success message after a successful submission", async () => {
    submitConsultation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Đã nhận thông tin");
  });

  it("clears the fields after a successful submission so a second click can't duplicate the lead", async () => {
    submitConsultation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));
    await screen.findByRole("status");

    expect(screen.getByLabelText("Họ tên phụ huynh")).toHaveValue("");
    expect(screen.getByLabelText("Số điện thoại")).toHaveValue("");
    expect(screen.getByLabelText("Lớp")).toHaveValue("");
    expect(screen.getByLabelText("Môn quan tâm")).toHaveValue("");
    expect(screen.getByLabelText("Hình thức học")).toHaveValue("");
  });

  it("does not clear the fields after a failed submission, so the parent doesn't retype everything", async () => {
    submitConsultation.mockResolvedValue({ ok: false, error: "phone_invalid" });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));
    await screen.findByRole("alert");

    expect(screen.getByLabelText("Họ tên phụ huynh")).toHaveValue("Nguyễn Văn A");
  });

  it("translates the error identifier returned by the action", async () => {
    submitConsultation.mockResolvedValue({ ok: false, error: "phone_invalid" });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Số điện thoại không hợp lệ");
  });

  it("falls back to the generic error message for an unrecognized identifier", async () => {
    submitConsultation.mockResolvedValue({ ok: false, error: "some_unmapped_id" });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Gửi chưa thành công");
  });

  it("recovers when the server action rejects instead of resolving", async () => {
    submitConsultation.mockRejectedValue(new Error("network error"));
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    const submitButton = screen.getByRole("button", { name: "Gửi đăng ký" });
    await user.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent("Gửi chưa thành công");
    expect(screen.getByRole("button", { name: "Gửi đăng ký" })).not.toBeDisabled();
  });
});
