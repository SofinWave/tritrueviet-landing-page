import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * AI / answer-engine crawlers explicitly welcomed, grouped by vendor. Listing
 * them by name makes the allow-intent unambiguous even as generic rules evolve.
 *
 * Two things about this list are load-bearing:
 *
 * 1. Each vendor ships *several* agents with different jobs — a training
 *    crawler, a search indexer, and a fetch-on-behalf-of-a-user agent. They are
 *    not interchangeable: allowing `GPTBot` but not `OAI-SearchBot` keeps the
 *    site out of ChatGPT's search index even though its training crawler is
 *    welcome, and allowing `ClaudeBot` but not `Claude-User` means Claude
 *    cannot open the page when a user asks it to. All three roles have to be
 *    named per vendor or the coverage has a hole in exactly the place that
 *    matters for citations.
 * 2. A named `User-agent` group *replaces* the `*` group for that agent rather
 *    than layering on top of it, which is why every rule below re-states the
 *    `/api/` disallow instead of inheriting it.
 */

/** OpenAI — ChatGPT, ChatGPT Search, GPTs. Priority vendor. */
const OPENAI_CRAWLERS = [
  "GPTBot", // model training + general crawl
  "OAI-SearchBot", // ChatGPT Search index — the one that produces citations
  "ChatGPT-User", // fetches a page because a user asked ChatGPT to
];

/** Anthropic — Claude, Claude Search. Priority vendor. */
const ANTHROPIC_CRAWLERS = [
  "ClaudeBot", // current general crawler
  "Claude-SearchBot", // search index behind Claude's web results
  "Claude-User", // fetches a page on behalf of a user's request
  "Claude-Web", // legacy, still seen in the wild
  "anthropic-ai", // legacy
];

/**
 * Google — Gemini and Vertex grounding. Priority vendor.
 *
 * `Googlebot` itself is deliberately absent: it is covered by the `*` rule, and
 * naming it here would create a group that overrides the generic one. What
 * matters for Gemini is `Google-Extended`, which is not a crawler at all but
 * the opt-in token deciding whether content Googlebot already fetched may be
 * used to ground a Gemini answer. Omitting it leaves the site crawled but
 * unusable as an answer source.
 */
const GOOGLE_CRAWLERS = [
  "Google-Extended", // Gemini / Vertex AI grounding opt-in
  "GoogleOther", // non-Search Google fetches, incl. AI product R&D
  "Google-CloudVertexBot", // Vertex AI Search grounding fetches
];

/** Everyone else, so coverage is not limited to the three priority vendors. */
const OTHER_AI_CRAWLERS = [
  "PerplexityBot",
  "Perplexity-User",
  "Applebot", // Siri / Spotlight; also the fetcher behind Apple Intelligence
  "Applebot-Extended",
  "Amazonbot", // Alexa / Rufus
  "meta-externalagent", // Meta AI
  "Bytespider", // Doubao / TikTok
  "DuckAssistBot",
  "cohere-ai",
  "YouBot",
  "CCBot", // Common Crawl — the corpus many smaller models train on
];

export const AI_CRAWLERS = [
  ...OPENAI_CRAWLERS,
  ...ANTHROPIC_CRAWLERS,
  ...GOOGLE_CRAWLERS,
  ...OTHER_AI_CRAWLERS,
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/api/"] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
