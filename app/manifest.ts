import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: "Trung tâm gia sư kèm 1-1, nhóm nhỏ và online cho học sinh THCS và THPT.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
