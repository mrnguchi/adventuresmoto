export type AccountModalView = "login" | "signup" | "password-recovery";

export type ProtectedAccountArea =
  | "account"
  | "garage"
  | "wishlist"
  | "cart";

export const protectedAreaCopy: Record<
  ProtectedAccountArea,
  { title: string; description: string }
> = {
  account: {
    title: "Your account, all in one place",
    description: "Sign in to view your profile, orders and saved details.",
  },
  garage: {
    title: "Save your bike to My Garage",
    description:
      "Sign in to save your motorcycle and find parts that fit every time.",
  },
  wishlist: {
    title: "Keep your favourites close",
    description: "Sign in to save products to your wishlist across devices.",
  },
  cart: {
    title: "Your cart is waiting",
    description: "Sign in to view your cart and continue to checkout.",
  },
};
