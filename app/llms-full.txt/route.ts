export { GET } from "../llms.txt/route";

/**
 * Alias of `/llms.txt`.
 *
 * The llms.txt convention splits a large site into an index (`llms.txt`) and
 * the expanded content (`llms-full.txt`), and several crawlers probe the
 * `-full` path first. This site is a single landing page, so its index already
 * *is* the full content — serving the same body here answers that probe instead
 * of returning a 404 that reads as "no machine-readable copy exists".
 *
 * `dynamic` is re-declared rather than re-exported alongside `GET`: Next parses
 * the route segment config statically at build time and rejects a re-exported
 * one outright ("Next.js can't recognize the exported `dynamic` field").
 */
export const dynamic = "force-static";
