import { TruckIcon } from "../icons";

export function ShippingStrip() {
  return (
    <div className="shipping-strip">
      <div className="site-container shipping-inner">
        <span>
          <TruckIcon width={19} height={19} />
          $10 shipping Australia wide
        </span>
        <i aria-hidden="true" />
        <span>Easy 30-day returns</span>
      </div>
    </div>
  );
}
