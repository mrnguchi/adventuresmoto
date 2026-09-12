import { StorefrontHeader } from "@/components/storefront-header";
import { CartCheckout } from "@/components/cart-checkout";
import "../cart/checkout.css";
export const metadata = { title: "Checkout", robots: { index: false, follow: false } };
export default function Page() { return <><StorefrontHeader /><main className="site-container"><CartCheckout checkout /></main></>; }
