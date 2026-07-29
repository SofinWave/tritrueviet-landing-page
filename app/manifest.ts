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
    // The brand red from public/images/logo.png — keep in step with --primary.
    theme_color: "#bf1516",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
