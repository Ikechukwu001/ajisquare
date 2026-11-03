import { getCategories, getFeaturedProducts } from "@/lib/server/catalog";
import PromoBanner from "@/components/home/PromoBanner";
import Hero from "@/components/home/Hero";
import ServicesSection from "@/components/home/ServicesSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChoose from "@/components/home/WhyChoose";
import CtaSection from "@/components/home/CtaSection";

// Refresh catalog data at most once a minute
export const revalidate = 60;

async function safely(fn) {
  try {
    return await fn();
  } catch (err) {
    console.error("Homepage data error:", err.message);
    return [];
  }
}

export default async function Home() {
  const [categories, featured] = await Promise.all([
    safely(getCategories),
    safely(getFeaturedProducts),
  ]);

  return (
    <>
      <PromoBanner />
      <Hero />
      <ServicesSection />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured.slice(0, 8)} />
      <WhyChoose />
      <CtaSection />
    </>
  );
}