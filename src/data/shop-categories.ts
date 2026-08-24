export type ShopCategory = {
  title: string;
  image: string;
  href: string;
  alt: string;
};

export const shopCategories: ShopCategory[] = [
  {
    title: "Men's Jackets",
    image: "/images/mens-jacket.png",
    href: "/collections/riding-gear/mens-jackets",
    alt: "Black adventure motorcycle jacket",
  },
  {
    title: "Men's Pants",
    image: "/images/mens-pants.png",
    href: "/collections/riding-gear/mens-pants",
    alt: "Black adventure motorcycle pants",
  },
  {
    title: "Women's Jackets",
    image: "/images/womens-jacket.png",
    href: "/collections/riding-gear/womens-jackets",
    alt: "Grey and high-visibility women's motorcycle jacket",
  },
  {
    title: "Women's Pants",
    image: "/images/womens-pants.png",
    href: "/collections/riding-gear/womens-pants",
    alt: "Grey women's adventure motorcycle pants",
  },
  {
    title: "Helmets",
    image: "/images/helmets.png",
    href: "/collections/riding-gear/helmets",
    alt: "Grey adventure motorcycle helmet",
  },
  {
    title: "Boots",
    image: "/images/boots.png",
    href: "/collections/riding-gear/boots",
    alt: "Black adventure motorcycle boot",
  },
  {
    title: "Luggage",
    image: "/images/luggage.png",
    href: "/collections/luggage",
    alt: "Black and yellow adventure motorcycle backpack",
  },
  {
    title: "Tyres",
    image: "/images/tyres.png",
    href: "/collections/tyres",
    alt: "Adventure motorcycle tyre",
  },
];
