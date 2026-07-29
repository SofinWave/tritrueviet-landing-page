import { buildLlmsTxt } from "@/lib/llms-txt";

/**
 * Prerendered at build time. This route sits outside `app/[locale]/` on
 * purpose: `/llms.txt` is a well-known path an answer engine probes at the
 * domain root, so it must not carry a locale prefix, and `proxy.ts` must keep
 * letting it through unrewritten.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
