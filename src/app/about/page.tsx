import Image from "next/image";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront-header";
import "./about.css";

export const metadata = {
  title: "About us",
  description: "Get to know Adventures Moto. Riding gear, motorcycle parts and essentials for the road less travelled.",
};

const values = [
  { title: "Quality first", text: "Durability, comfort and practical design matter when you’re a long way from home. We focus on gear that earns its place on your bike." },
  { title: "Rider protection", text: "From helmets and jackets to boots and gloves, find protective gear suited to your riding, your fit and the conditions ahead." },
  { title: "Helpful advice", text: "Choosing the right setup can raise a lot of questions. Talk to us about sizing, bike compatibility and what you need for your next trip." },
  { title: "Practical essentials", text: "Find riding gear, luggage and motorcycle accessories for everyday rides and longer journeys." },
];

export default function AboutPage() {
  return <>
    <StorefrontHeader />
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <Image src="/images/our-story.jpg" alt="" fill sizes="100vw" priority className="about-hero-image" />
        <div className="about-hero-shade" />
        <div className="site-container about-hero-content">
          <h1 id="about-title">About<br /><span>Adventures<br />Moto</span></h1>
          <p>Gear for riders who seek the road less travelled.</p>
        </div>
      </section>

      <section className="site-container about-story" aria-labelledby="about-story-title">
        <div className="about-story-copy">
          <h2 id="about-story-title">Our <span>story</span></h2>
          <p>Adventure starts with the decision to go a little further. A quiet back road, a stretch of dirt, a night under the trees — the best part of riding is often what you find along the way.</p>
          <p>Adventures Moto brings together riding gear, motorcycle parts, luggage and everyday essentials to help you prepare for that journey. Whether you’re setting up for your first weekend away or planning a longer trip, we want finding the right equipment to feel straightforward.</p>
          <p>There’s no single way to ride an adventure. Your bike, your route and your pace are your own. Our focus is on helping you choose gear that suits the ride you have in mind.</p>
        </div>
        <Image className="about-story-image" src="/images/about%20page%20image.JPG" alt="Motorcycle riders relaxing around a campfire in the forest" width={1410} height={1080} sizes="(max-width: 800px) 100vw, 50vw" />
      </section>

      <section className="site-container about-values" aria-labelledby="about-values-title">
        <h2 id="about-values-title">What drives <span>us</span></h2>
        <div className="about-values-grid">{values.map((value) => <article key={value.title}><h3>{value.title}</h3><p>{value.text}</p></article>)}</div>
      </section>

      <section className="site-container about-choice" aria-labelledby="about-choice-title">
        <h2 id="about-choice-title">For the ride.<br /><span>And everything around it.</span></h2>
        <p>From getting your bike ready to packing for a few days away, bring your next adventure together in one place.</p>
        <div className="about-choice-links"><Link href="/collections/riding-gear">Riding gear</Link><Link href="/collections/parts">Bike parts</Link><Link href="/collections/luggage">Luggage</Link></div>
      </section>

      <section className="about-cta" aria-labelledby="about-cta-title">
        <div className="site-container">
          <h2 id="about-cta-title">Ready to start your next adventure?</h2>
          <p>Explore the range and find what you need for the road ahead.</p>
          <div className="about-cta-actions"><Link href="/store">Shop now</Link><a href="mailto:sales@adventuresmoto.com">Contact us</a></div>
        </div>
      </section>
    </main>
  </>;
}
