import Image from "next/image";
import Link from "next/link";

export function OurStory() {
  return (
    <section className="our-story" aria-labelledby="our-story-title">
      <Image
        className="our-story-background"
        src="/images/our-story.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className="our-story-overlay" aria-hidden="true" />

      <div className="site-container our-story-inner">
        <div className="our-story-content">
          <Image
            className="our-story-logo"
            src="/images/logo.png"
            alt="Adventures Moto"
            width={304}
            height={108}
          />
          <h2 id="our-story-title">Our Story</h2>
          <p>
            At Adventures Moto, we listen to what the motorcycle gods have to
            tell us. In harsh conditions and across endless dirt tracks,
            they&apos;re speaking loud and clear: ride hard, but ride protected.
          </p>
          <Link href="/collections">Shop Now</Link>
        </div>
      </div>
    </section>
  );
}
