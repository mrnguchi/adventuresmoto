ALTER TABLE `carts` ADD COLUMN `version` INTEGER UNSIGNED NOT NULL DEFAULT 0;
CREATE TABLE `order_notifications` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `orderId` INTEGER NOT NULL,
  `audience` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `lockedAt` DATETIME(3) NULL,
  `sentAt` DATETIME(3) NULL,
  `lastError` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `order_notifications_orderId_audience_key` (`orderId`, `audience`),
  INDEX `order_notifications_status_idx` (`status`),
  CONSTRAINT `order_notifications_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
