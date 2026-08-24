import { PageLoader } from "@/components/loaders/page-loader";
import { StorefrontHeader } from "@/components/storefront-header";

export default function Loading() {
  return (
    <>
      <StorefrontHeader />
      <PageLoader label="Loading your next adventure" />
    </>
  );
}
