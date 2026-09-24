import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import "./shipping.css";

export const metadata = { title: "Shipping policy", description: "Australian delivery, dispatch, international shipping and tracking information for Adventures Moto orders." };
const sections = [
  { id: "dispatch", title: "Stock & dispatch", text: "In-stock orders confirmed before 2pm on weekdays are eligible for same-day dispatch. Later orders are processed the next business day. Custom and order-in items take longer." },
  { id: "australia", title: "Australian shipping", text: "Standard shipping is $10 Australia wide. Express freight depends on parcel weight and destination. We confirm delivery charges before payment. Some items ship separately from supplier warehouses." },
  { id: "dangerous-goods", title: "Dangerous goods", text: "Oils, aerosols and similar products require special handling and may arrive separately. International delivery is unavailable for these items. Contact us before arranging a return." },
  { id: "overseas", title: "New Zealand & international requests", text: "Contact us for New Zealand freight quotes. Other international destinations require individual approval. Any applicable import charges are the recipient’s responsibility." },
  { id: "norfolk", title: "Norfolk Island", text: "Sea freight can take 4–8 weeks, with weather-related delays. Ask about air delivery options." },
  { id: "tracking", title: "Delivery & tracking", text: "Delivery estimates exclude weekends and public holidays. Contact our team with your order reference for dispatch and tracking updates." },
  { id: "returned", title: "Returned parcels", text: "Contact us to arrange redelivery, credit or a refund. Freight costs may be deducted unless the return was our fault." },
];
export default function ShippingPolicyPage() {
  return <><StorefrontHeader /><main className="site-container shipping-policy-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Shipping policy</span></nav>
    <header className="shipping-policy-heading"><h1>Shipping policy</h1><p>Delivery information for your next adventure.</p></header>
    <div className="shipping-policy-layout"><nav className="shipping-policy-contents" aria-label="On this page"><h2>On this page</h2>{sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav>
      <div className="shipping-policy-copy"><aside className="shipping-policy-notice"><strong>Ordering through this website</strong><p>Checkout submits an order request. We confirm availability, delivery and payment arrangements with you before proceeding. No payment is collected online.</p></aside>
        {sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2><p>{section.text}</p></section>)}
        <section><h2>Need help?</h2><p><Link href="/contact">Send us a request</Link> or call <a href="tel:+61283485100">02 8348 5100</a>.</p></section>
      </div>
    </div>
  </main></>;
}
