import { StorefrontHeader } from "@/components/storefront-header";
import { CartCheckout } from "@/components/cart-checkout";
import "./checkout.css";
export const metadata = { title: "Your cart", robots: { index: false, follow: false } };
export default function Page() { return <><StorefrontHeader /><main className="site-container"><CartCheckout /></main></>; }
