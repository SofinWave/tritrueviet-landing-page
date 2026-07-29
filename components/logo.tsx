import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_SHORT_NAME } from "@/lib/site";
import logoMark from "@/public/images/logo-mark.png";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-extrabold", className)}>
      {/* The mark is the brand red on transparency, which measures 1.00:1 against the
          red header and 1.40:1 against the dark ink band — invisible on both. The white
          chip is what keeps it legible everywhere without altering the artwork itself.
          On light surfaces the chip simply disappears into the page. */}
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-white p-1">
        {/* width/height are given explicitly rather than relying on the static
            import's intrinsic size: vitest resolves the PNG to a plain URL string,
            so without them every test that renders the header or footer throws. */}
        <Image
          src={logoMark}
          alt=""
          width={36}
          height={36}
          className="size-full object-contain"
          priority
        />
      </span>
      {/* Live text, not the wordmark baked into logo.png: at the header's 36px the
          image's own three text bands render 4px, 4px and 1px tall. */}
      <span className="text-lg tracking-[-0.03em]">{SITE_SHORT_NAME}</span>
    </span>
  );
}
