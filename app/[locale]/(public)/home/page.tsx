import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { Achievements } from "./_components/achievements";
import { Contact } from "./_components/contact";
import { Courses } from "./_components/courses";
import { Faq } from "./_components/faq";
import { SiteFooter } from "./_components/footer";
import { Formats } from "./_components/formats";
import { Hero } from "./_components/hero";
import { Pricing } from "./_components/pricing";
import { Process } from "./_components/process";
import { Stats } from "./_components/stats";
import { Teachers } from "./_components/teachers";
import { Testimonials } from "./_components/testimonials";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData locale={locale} />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Courses />
        <Formats />
        <Process />
        <Teachers />
        <Achievements />
        <Pricing />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
