"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneIcon } from "../icons";
import { isPathActive, utilityLinks } from "./header-data";

export function UtilityBar() {
  const pathname = usePathname();

  return (
    <div className="utility-bar">
      <div className="site-container utility-inner">
        <p>Built for the long way round.</p>
        <nav aria-label="Utility navigation">
          {utilityLinks.map((link) => {
            const active = isPathActive(pathname, link.href);

            return (
              <Link
                className={active ? "is-current" : ""}
                href={link.href}
                aria-current={active ? "page" : undefined}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
          <a className="utility-phone" href="tel:+61283485100">
            <PhoneIcon width={14} height={14} />
            02 8348 5100
          </a>
        </nav>
      </div>
    </div>
  );
}
