import { TruckIcon } from "../icons";

export function ShippingStrip() {
  return (
    <div className="shipping-strip">
      <div className="site-container shipping-inner">
        <span>
          <TruckIcon width={19} height={19} />
          Free shipping over $99
        </span>
        <i aria-hidden="true" />
        <span>Easy 30-day returns</span>
        <i aria-hidden="true" />
        <span>Adventure-ready support</span>
      </div>
    </div>
  );
}
