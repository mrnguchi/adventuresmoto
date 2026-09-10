import { ProductDetailView } from "@/components/store/product-details";
import { StorefrontHeader } from "@/components/storefront-header";
import { GarageSelector } from "@/components/garage-selector";
import type { ProductDetails } from "@/lib/product-details";

export const metadata = { title: "Product page preview", robots: { index: false, follow: false } };
const product: ProductDetails = {
  slug: "preview", name: "Adventure riding jacket", brand: "Adventures Moto",
  price: 499.95, images: [{ src: "/images/mens-jacket.png", alt: "Black adventure motorcycle jacket" }],
  category: { name: "Men's Jackets", href: "/collections/riding-gear/mens-jackets" }, wearable: true,
  variants: ["S", "M", "L", "XL", "2XL", "3XL"].map((size) => ({ sku: `PREVIEW-JACKET-${size}`, label: size, inStock: !["L", "XL"].includes(size) })),
  description: ["From the morning commute to the long way home. This sample product shows how riding gear will be presented, with a clear view of the product, available sizes and the information riders need before choosing their kit.", "The final product description, materials and specifications will be supplied with each product. This preview uses an existing project image and illustrative pricing and availability."],
  features: [{ title: "Product highlights", items: ["A dedicated space for construction and materials", "Protection and comfort features", "Storage, adjustment and fit information", "Care instructions and included accessories"] }],
};
export default function Preview() {
  return <><StorefrontHeader /><main><GarageSelector /><ProductDetailView product={product} preview /></main></>;
}
