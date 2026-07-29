import type { MetadataRoute } from "next";
import { LocaleSupport } from "@/enums";
import { SITE_NAME, SITE_SHORT_NAME, SITE_THEME_COLOR } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description:
      "Trung tâm gia sư kèm 1-1, nhóm nhỏ và online cho học sinh lớp 1–12, kèm các khoá lập trình.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: SITE_THEME_COLOR,
    lang: LocaleSupport.VI,
    categories: ["education"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
