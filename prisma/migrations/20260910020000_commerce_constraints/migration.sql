-- Enforced on MySQL >= 8.0.16 and MariaDB >= 10.2.1.
-- Keep these custom constraints when exporting/importing or baselining Prisma.
ALTER TABLE `products`
  ADD CONSTRAINT `products_price_nonnegative` CHECK (`price` >= 0),
  ADD CONSTRAINT `products_compare_price_valid` CHECK (`compareAtPrice` IS NULL OR `compareAtPrice` >= `price`);
ALTER TABLE `product_variants`
  ADD CONSTRAINT `variants_price_nonnegative` CHECK (`price` IS NULL OR `price` >= 0),
  ADD CONSTRAINT `variants_compare_nonnegative` CHECK (`compareAtPrice` IS NULL OR `compareAtPrice` >= 0),
  ADD CONSTRAINT `variants_compare_price_valid` CHECK (`price` IS NULL OR `compareAtPrice` IS NULL OR `compareAtPrice` >= `price`);
ALTER TABLE `inventory_balances`
  ADD CONSTRAINT `inventory_reserved_within_stock` CHECK (`reserved` <= `onHand`);
ALTER TABLE `stock_reservations`
  ADD CONSTRAINT `reservations_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `movements_delta_nonzero` CHECK (`delta` <> 0);
ALTER TABLE `bundle_components`
  ADD CONSTRAINT `bundles_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_rating_range` CHECK (`rating` BETWEEN 1 AND 5);
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_quantity_positive` CHECK (`quantity` > 0),
  ADD CONSTRAINT `order_item_amounts_nonnegative` CHECK (`unitPrice` >= 0 AND `discountTotal` >= 0 AND `taxTotal` >= 0 AND `lineTotal` >= 0),
  ADD CONSTRAINT `order_item_discount_limit` CHECK (`discountTotal` <= `unitPrice` * `quantity`),
  ADD CONSTRAINT `order_item_total_consistent` CHECK (`lineTotal` = `unitPrice` * `quantity` - `discountTotal`);
ALTER TABLE `orders`
  ADD CONSTRAINT `order_amounts_nonnegative` CHECK (`subtotal` >= 0 AND `discountTotal` >= 0 AND `shippingTotal` >= 0 AND `taxTotal` >= 0 AND `grandTotal` >= 0),
  ADD CONSTRAINT `order_discount_limit` CHECK (`discountTotal` <= `subtotal`),
  -- Tax-inclusive totals: taxTotal is the included tax component, not added again.
  ADD CONSTRAINT `order_total_consistent` CHECK (`grandTotal` = `subtotal` - `discountTotal` + `shippingTotal`);
ALTER TABLE `payments`
  ADD CONSTRAINT `payment_amount_positive` CHECK (`amount` > 0);
ALTER TABLE `refunds`
  ADD CONSTRAINT `refund_amount_positive` CHECK (`amount` > 0);
ALTER TABLE `shipment_items`
  ADD CONSTRAINT `shipment_quantity_positive` CHECK (`quantity` > 0);
