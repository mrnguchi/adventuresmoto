export type HeroSlide = {
  id: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  href: string;
  linkLabel: string;
};

// The filenames are not in the same order, so I pair these by the promotion shown.
export const heroSlides: [HeroSlide, HeroSlide, HeroSlide] = [
  {
    id: "loboo-luggage",
    desktopImage: "/images/hero-carou-3.jpg",
    mobileImage: "/images/hero-carou-img-2.jpg",
    alt: "Loboo adventure motorcycle luggage",
    href: "/collections/loboo",
    linkLabel: "Shop Loboo motorcycle luggage",
  },
  {
    id: "klim-2026",
    desktopImage: "/images/hero-carou-2.jpg",
    mobileImage: "/images/hero-carou-img-1.jpg",
    alt: "Klim 2026 adventure riding gear collection",
    href: "/collections/klim",
    linkLabel: "Shop the Klim 2026 range",
  },
  {
    id: "dirty-weekend",
    desktopImage: "/images/hero-carou-1.jpg",
    mobileImage: "/images/hero-carou-img-3.jpg",
    alt: "Dirty Weekend 2026 adventure motorcycle event",
    href: "/events/dirty-weekend-2026",
    linkLabel: "Explore the Dirty Weekend 2026 event",
  },
];
