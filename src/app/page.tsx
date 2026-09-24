import { StorefrontHeader } from "@/components/storefront-header";
import { GarageSelector } from "@/components/garage-selector";
import { HeroSlider } from "@/components/hero-slider";
import { ShopCategories } from "@/components/shop-categories";
import { OurStory } from "@/components/our-story";

export default function Home() {
  return (
    <>
      <StorefrontHeader />
      <main>
        <GarageSelector />
        <HeroSlider />
        <ShopCategories />
        <OurStory />
      </main>
    </>
  );
}
