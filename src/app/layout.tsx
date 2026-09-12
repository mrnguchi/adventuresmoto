import type { Metadata } from "next";
import { AccountProvider } from "@/components/account/account-provider";
import { CartProvider } from "@/components/cart-provider";
import { StorefrontFooter } from "@/components/storefront-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Adventures Moto | Gear for the ride ahead",
    template: "%s | Adventures Moto",
  },
  description:
    "Adventure motorcycle riding gear, parts, luggage, tyres, tools and accessories for every journey.",
  icons: {
    icon: [{ url: "/images/favicon.png", type: "image/png" }],
    apple: [{ url: "/images/favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AccountProvider>
          <CartProvider>
          {children}
          <StorefrontFooter />
          </CartProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
