import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import { ContactForm } from "./request-form";
import "./contact.css";

export const metadata = { title: "Contact us", description: "Contact Adventures Moto for help with products, bike compatibility and order requests. Find our opening hours and send an enquiry." };
export default function ContactPage() {
  return <><StorefrontHeader /><main className="site-container contact-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Contact us</span></nav>
    <header className="contact-heading"><h1>Get in touch</h1><p>Need help with your gear, bike compatibility or an order? We’re here to help.</p></header>
    <div className="contact-layout"><aside className="contact-information">
      <section><h2>Talk to us</h2><a href="tel:+61283485100">02 8348 5100</a><a href="mailto:sales@adventuresmoto.com">sales@adventuresmoto.com</a></section>
      <section><h2>Visit us</h2><address>Unit 3/915 Old Northern Road<br />Dural, NSW 2158<br />Australia</address></section>
      <section><h2>Opening hours</h2><dl><div><dt>Monday–Friday</dt><dd>9:00 AM–5:00 PM</dd></div><div><dt>Saturday</dt><dd>9:00 AM–3:00 PM</dd></div><div><dt>Sunday</dt><dd>10:00 AM–2:00 PM</dd></div></dl><p className="contact-note">All times are local to Sydney. Please contact us to confirm public holiday hours.</p></section>
    </aside><section className="contact-form-panel" aria-labelledby="contact-form-title"><h2 id="contact-form-title">Send us a request</h2><p>Tell us what you need and we’ll get back to you by email.</p><ContactForm /></section></div>
  </main></>;
}
