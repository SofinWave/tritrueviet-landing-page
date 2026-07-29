import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import duongTrungKien from "@/public/images/tutors/duong-trung-kien.png";
import haHuyAnh from "@/public/images/tutors/ha-huy-anh.webp";
import hoangThuHuong from "@/public/images/tutors/hoang-thu-huong.png";
import phamLinhThu from "@/public/images/tutors/pham-linh-thu.png";

type Teacher = { name: string; subject: string; credential: string; photo: string };

// Looked up by the `photo` identifier on each `teachers.items[]` entry, the same
// shape `formats.tsx` uses for its icons — the catalog can be reordered or
// translated without the portraits sliding onto the wrong person. Exported so a
// test can pin every identifier in both catalogs to a real key here.
export const PHOTOS: Record<string, StaticImageData> = {
  "pham-linh-thu": phamLinhThu,
  "hoang-thu-huong": hoangThuHuong,
  "duong-trung-kien": duongTrungKien,
  "ha-huy-anh": haHuyAnh,
};

export function Teachers() {
  const t = useTranslations("teachers");
  const items = t.raw("items") as Teacher[];

  return (
    <Section
      id="giao-vien"
      tone="muted"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((teacher) => {
          const photo = PHOTOS[teacher.photo];
          return (
            <Card key={teacher.photo} className="reveal h-full overflow-hidden pt-0 text-center">
              {photo ? (
                <div className="relative aspect-4/5 w-full bg-muted">
                  {/* The four source photos are portraits of different crops and one
                      full-body square; `object-top` is what keeps every face inside
                      the frame without a per-image focal point. */}
                  <Image
                    src={photo}
                    // Decorative: the name is live text directly below, so a
                    // non-empty alt makes a screen reader announce it twice.
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
              ) : null}
              <CardContent>
                <h3 className="text-lg font-semibold leading-none">{teacher.name}</h3>
                <p className="mt-2 text-sm font-medium text-primary">{teacher.subject}</p>
                <p className="mt-2 text-sm text-muted-foreground">{teacher.credential}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
