import { getImageProps } from "next/image";
import type { HeroSlide } from "@/data/hero-slides";

type HeroSlideImageProps = {
  slide: HeroSlide;
  priority?: boolean;
};

export function HeroSlideImage({
  slide,
  priority = false,
}: HeroSlideImageProps) {
  const common = {
    alt: slide.alt,
    sizes: "(max-width: 1500px) 100vw, 1440px",
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: slide.desktopImage,
    width: 2400,
    height: 1125,
    quality: 75,
  });

  const {
    props: { srcSet: mobileSrcSet, ...mobileImageProps },
  } = getImageProps({
    ...common,
    src: slide.mobileImage,
    width: 1080,
    height: 1080,
    quality: 75,
  });

  return (
    <picture className="slide-picture">
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
      {/* I use picture here so each screen size only downloads its own slide image. */}
      <img
        {...mobileImageProps}
        alt={slide.alt}
        fetchPriority={priority ? "high" : undefined}
      />
    </picture>
  );
}
