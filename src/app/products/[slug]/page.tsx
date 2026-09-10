import { notFound } from "next/navigation";
import { getProductDetails } from "@/lib/product-details";
import { ProductDetailView } from "@/components/store/product-details";
import { StorefrontHeader } from "@/components/storefront-header";
import { GarageSelector } from "@/components/garage-selector";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const product = await getProductDetails((await params).slug);
  return { title: product?.name ?? "Product not found" };
}
export default async function Page({ params }: Props) {
  const product = await getProductDetails((await params).slug);
  if (!product) notFound();
  return <><StorefrontHeader /><main><GarageSelector /><ProductDetailView key={product.slug} product={product} /></main></>;
}
