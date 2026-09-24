import Image from "next/image";
import Link from "next/link";

import { AccountAccessButton } from "@/components/account/account-access-button";
import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  PinIcon,
  YoutubeIcon,
} from "@/components/icons";
import { footerBenefits, footerLinkGroups } from "@/data/footer";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-benefits">
        <div className="site-container footer-benefits-grid">
          {footerBenefits.map((benefit) => (
            <Link
              className="footer-benefit"
              href={benefit.href}
              key={benefit.title}
            >
              <Image
                src={benefit.image}
                alt=""
                width={128}
                height={128}
              />
              <span>{benefit.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="footer-main">
        <div className="site-container">
          <div className="footer-link-groups">
            {footerLinkGroups.map((group) => (
              <nav aria-label={`${group.title} links`} key={group.title}>
                <h2>{group.title}</h2>
                {group.links.map((link) =>
                  link.href === "/account" ? (
                    <AccountAccessButton key={link.href}>
                      {link.label}
                    </AccountAccessButton>
                  ) : (
                    <Link href={link.href} key={link.href}>
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            ))}
          </div>

          <div className="footer-details">
            <div className="footer-brand">
              <Link href="/" aria-label="Adventures Moto home">
                <Image
                  src="/images/logo.png"
                  alt="Adventures Moto"
                  width={304}
                  height={108}
                />
              </Link>
              <p>Follow us:</p>
              <div className="footer-socials" aria-label="Social media">
                <Link href="/social/facebook" aria-label="Facebook">
                  <FacebookIcon />
                </Link>
                <Link href="/social/instagram" aria-label="Instagram">
                  <InstagramIcon />
                </Link>
                <Link href="/social/youtube" aria-label="YouTube">
                  <YoutubeIcon />
                </Link>
              </div>
            </div>

            <div className="footer-contact">
              <h2>Contact</h2>
              <address>
                <a href="tel:+61283485100">
                  <PhoneIcon />
                  <span>02 8348 5100</span>
                </a>
                <span>
                  <PinIcon />
                  <span>Unit 3/915 Old Northern Road, Dural, NSW 2158</span>
                </span>
              </address>
            </div>

            <div className="footer-hours">
              <h2>Regular Opening Hours</h2>
              <div>
                <ClockIcon />
                <p>
                  <span>Mon–Fri: 9:00 AM – 5:00 PM</span>
                  <span>Sat: 9:00 AM – 3:00 PM</span>
                  <span>Sun: 10:00 AM – 2:00 PM</span>
                </p>
              </div>
            </div>
          </div>

          <div className="footer-legal">
            <p>© 2026 Adventures Moto. All rights reserved.</p>
            <nav aria-label="Legal">
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
