"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "@/components/account/account-provider";
import {
  CartIcon,
  CloseIcon,
  GarageIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";
import { ProductNavigation } from "./header/product-navigation";
import { ShippingStrip } from "./header/shipping-strip";
import { UtilityBar } from "./header/utility-bar";

type HeaderSearchProps = {
  mobile?: boolean;
};

function HeaderSearch({ mobile = false }: HeaderSearchProps) {
  const id = mobile ? "mobile-site-search" : "site-search";

  return (
    <form
      className={`header-search ${mobile ? "mobile-search" : ""}`}
      action="/search"
      role="search"
    >
      <label className="sr-only" htmlFor={id}>
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder={
          mobile
            ? "Search gear, parts & accessories"
            : "What do you need for your next ride?"
        }
      />
      <button type="submit" aria-label="Search">
        <SearchIcon />
      </button>
    </form>
  );
}

export function StorefrontHeader() {
  const router = useRouter();
  const { openAccount, requireAccount } = useAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  function openGarage() {
    document.getElementById("my-garage")?.scrollIntoView();
  }

  function openProtectedPage(area: "cart" | "wishlist", href: string) {
    if (requireAccount(area)) {
      router.push(href);
    }
  }

  return (
    <header className="site-header">
      <UtilityBar />

      <div className="main-header">
        <div className="site-container main-header-inner">
          <button
            className="mobile-menu-button icon-button"
            type="button"
            aria-label={menuOpen ? "Close product menu" : "Open product menu"}
            aria-expanded={menuOpen}
            aria-controls="product-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link className="brand-link" href="/" aria-label="Adventures Moto home">
            <Image
              src="/images/logo.png"
              alt="Adventures Moto"
              width={304}
              height={108}
              priority
            />
          </Link>

          <HeaderSearch />

          <nav className="customer-actions" aria-label="Customer actions">
            <button
              className="garage-action"
              type="button"
              aria-label="My Garage"
              onClick={openGarage}
            >
              <GarageIcon />
              <span>My Garage</span>
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => openProtectedPage("wishlist", "/wishlist")}
            >
              <HeartIcon />
              <span>Wishlist</span>
            </button>
            <button
              type="button"
              aria-label="My account"
              onClick={() => openAccount("login", "account")}
            >
              <UserIcon />
              <span>Account</span>
            </button>
            <button
              className="cart-link"
              type="button"
              aria-label="Cart, 0 items"
              onClick={() => openProtectedPage("cart", "/cart")}
            >
              <CartIcon />
              <span>Cart</span>
              <b aria-hidden="true">0</b>
            </button>
          </nav>
        </div>

        <div className="site-container mobile-search-wrap">
          <HeaderSearch mobile />
        </div>
      </div>

      <ProductNavigation open={menuOpen} />
      <ShippingStrip />
    </header>
  );
}
