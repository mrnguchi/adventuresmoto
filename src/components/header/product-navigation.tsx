"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDownIcon } from "../icons";
import {
  isPathActive,
  productCategories,
  slugify,
} from "./header-data";

type ProductNavigationProps = {
  open: boolean;
  onNavigate: () => void;
  onClose: () => void;
};

export function ProductNavigation({ open, onNavigate, onClose }: ProductNavigationProps) {
  const pathname = usePathname();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const closeCategory = (categoryLabel: string) => {
    setOpenCategory((current) =>
      current === categoryLabel ? null : current,
    );
  };

  return (
    <nav
      id="product-navigation"
      className={`product-nav ${open ? "is-open" : ""}`}
      aria-label="Product navigation"
    >
      <div
        className="mobile-category-list"
        key={String(open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
      >
        <p className="mobile-menu-heading">Shop by category</p>
        {productCategories.map((category) => {
          const href = category.label === "Brands" ? "/brands" : `/collections/${slugify(category.label)}`;
          const sections = category.columns?.flatMap((column) => column.sections) ?? category.sections;
          return (
            <details className="mobile-category" key={category.label}>
              <summary>{category.label}<ChevronDownIcon width={18} height={18} /></summary>
              <div className="mobile-category-content">
                <Link href={href} onClick={onNavigate}>View all {category.label.toLowerCase()}</Link>
                {sections?.map((section) => (
                  <details className="mobile-subcategory" key={section.slug}>
                    <summary>{section.label}<ChevronDownIcon width={16} height={16} /></summary>
                    {section.items.map((item) => (
                      <Link key={item} href={`${href}/${section.slug}/${slugify(item)}`} onClick={onNavigate}>{item}</Link>
                    ))}
                  </details>
                ))}
                {category.items?.map((item) => (
                  <Link key={item} href={`${href}/${slugify(item)}`} onClick={onNavigate}>{item}</Link>
                ))}
              </div>
            </details>
          );
        })}
        <Link className="mobile-sale-link" href="/collections/sale" onClick={onNavigate}>Sale</Link>
        <div className="mobile-menu-links">
          <Link href="/garage" onClick={onNavigate}>My Garage</Link>
          <a href="tel:+61283485100" onClick={onNavigate}>Call us</a>
        </div>
      </div>
      <div className="site-container product-nav-inner">
        {productCategories.map((category) => {
          const isBrandsCategory = category.label === "Brands";
          const megaMenuColumns =
            category.columns ??
            category.sections?.map((section) => ({ sections: [section] }));
          const hasMegaMenu = Boolean(megaMenuColumns?.length);
          const categoryHref = isBrandsCategory
            ? "/brands"
            : `/collections/${slugify(category.label)}`;
          const active = isPathActive(pathname, categoryHref);
          const isOpen = openCategory === category.label;
          const menuId = `nav-menu-${slugify(category.label)}`;

          return (
            <div
              className={`nav-category ${
                category.featured ? "nav-featured" : ""
              } ${hasMegaMenu ? "has-mega-menu" : ""} ${
                active ? "is-current" : ""
              } ${isOpen ? "is-open" : ""}`}
              key={category.label}
              onMouseLeave={() => closeCategory(category.label)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  closeCategory(category.label);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeCategory(category.label);
                  event.currentTarget
                    .querySelector<HTMLButtonElement>(".nav-category-trigger")
                    ?.focus();
                }
              }}
            >
              <button
                className="nav-category-trigger"
                type="button"
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={() =>
                  setOpenCategory((current) =>
                    current === category.label ? null : category.label,
                  )
                }
              >
                {category.label}
                <ChevronDownIcon width={16} height={16} />
              </button>
              {hasMegaMenu ? (
                <div
                  id={menuId}
                  aria-hidden={!isOpen}
                  className={`nav-dropdown nav-mega-menu nav-mega-columns-${megaMenuColumns?.length} ${
                    category.showAll === false ? "nav-mega-no-action" : ""
                  } ${category.scrollable ? "nav-mega-scrollable" : ""}`}
                >
                  <div className="nav-mega-scroll">
                    {megaMenuColumns?.map((column) => (
                      <div
                        className="nav-mega-column"
                        key={column.sections
                          .map((section) => section.label)
                          .join("-")}
                      >
                        {column.sections.map((section) => (
                          <div
                            className="nav-mega-section"
                            key={section.label}
                          >
                            <h2>{section.label}</h2>
                            {section.items.map((item) => (
                              <Link
                                href={`${categoryHref}/${section.slug}/${slugify(item)}`}
                                key={item}
                                onClick={() => setOpenCategory(null)}
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {category.showAll !== false ? (
                    <div className="nav-mega-actions">
                      <Link
                        href={categoryHref}
                        onClick={() => setOpenCategory(null)}
                      >
                        Show all in {category.label}
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="nav-dropdown"
                  id={menuId}
                  aria-hidden={!isOpen}
                >
                  <p>Shop {category.label}</p>
                  {category.items?.map((item) => (
                    <Link
                      key={item}
                      onClick={() => setOpenCategory(null)}
                      href={
                        isBrandsCategory
                          ? `/brands/${slugify(item)}`
                          : `${categoryHref}/${slugify(item)}`
                      }
                    >
                      {item}
                    </Link>
                  ))}
                  <Link
                    className="nav-view-all"
                    href={categoryHref}
                    onClick={() => setOpenCategory(null)}
                  >
                    View all
                  </Link>
                </div>
              )}
            </div>
          );
        })}
        <Link
          className={`nav-sale ${
            isPathActive(pathname, "/collections/sale") ? "is-current" : ""
          }`}
          href="/collections/sale"
          aria-current={
            isPathActive(pathname, "/collections/sale") ? "page" : undefined
          }
        >
          Sale
        </Link>
      </div>
    </nav>
  );
}
