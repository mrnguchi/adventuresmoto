-- Adventures Moto: schema-only bootstrap for an EMPTY database.

-- Requires MySQL >= 8.0.16 or MariaDB >= 10.2.1; verify your hosting version.

-- Generated from migration history. No credentials, product data or migration bookkeeping.

-- Do not import into an existing database. See docs/database-schema.md for baselining.

SET NAMES utf8mb4;

-- Migration: 20260728004153_catalogue_foundation
-- CreateTable
CREATE TABLE `media_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `storageProvider` VARCHAR(50) NOT NULL,
    `storageKey` VARCHAR(500) NOT NULL,
    `publicUrl` VARCHAR(2048) NULL,
    `originalFileName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `altText` VARCHAR(500) NULL,
    `caption` TEXT NULL,
    `width` INTEGER UNSIGNED NULL,
    `height` INTEGER UNSIGNED NULL,
    `byteSize` BIGINT UNSIGNED NULL,
    `checksum` CHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,

    UNIQUE INDEX `media_assets_publicId_key`(`publicId`),
    UNIQUE INDEX `media_assets_storageKey_key`(`storageKey`),
    INDEX `media_assets_checksum_idx`(`checksum`),
    INDEX `media_assets_archivedAt_idx`(`archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `description` LONGTEXT NULL,
    `websiteUrl` VARCHAR(2048) NULL,
    `seoTitle` VARCHAR(255) NULL,
    `seoDescription` VARCHAR(500) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `logoAssetId` INTEGER NULL,
    `alternateLogoAssetId` INTEGER NULL,
    `heroAssetId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,

    UNIQUE INDEX `brands_publicId_key`(`publicId`),
    UNIQUE INDEX `brands_name_key`(`name`),
    UNIQUE INDEX `brands_slug_key`(`slug`),
    INDEX `brands_logoAssetId_idx`(`logoAssetId`),
    INDEX `brands_alternateLogoAssetId_idx`(`alternateLogoAssetId`),
    INDEX `brands_heroAssetId_idx`(`heroAssetId`),
    INDEX `brands_status_archivedAt_displayOrder_idx`(`status`, `archivedAt`, `displayOrder`),
    INDEX `brands_isFeatured_status_archivedAt_displayOrder_idx`(`isFeatured`, `status`, `archivedAt`, `displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `parentId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `description` LONGTEXT NULL,
    `seoTitle` VARCHAR(255) NULL,
    `seoDescription` VARCHAR(500) NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `imageAssetId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,

    UNIQUE INDEX `categories_publicId_key`(`publicId`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parentId_status_archivedAt_displayOrder_idx`(`parentId`, `status`, `archivedAt`, `displayOrder`),
    INDEX `categories_imageAssetId_idx`(`imageAssetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `redirects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `sourcePath` VARCHAR(500) NOT NULL,
    `destinationPath` VARCHAR(2048) NOT NULL,
    `httpStatus` SMALLINT UNSIGNED NOT NULL DEFAULT 301,
    `preserveQueryString` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,

    UNIQUE INDEX `redirects_publicId_key`(`publicId`),
    UNIQUE INDEX `redirects_sourcePath_key`(`sourcePath`),
    INDEX `redirects_isActive_archivedAt_idx`(`isActive`, `archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_logoAssetId_fkey` FOREIGN KEY (`logoAssetId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_alternateLogoAssetId_fkey` FOREIGN KEY (`alternateLogoAssetId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brands` ADD CONSTRAINT `brands_heroAssetId_fkey` FOREIGN KEY (`heroAssetId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_imageAssetId_fkey` FOREIGN KEY (`imageAssetId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260910000000_store_products
-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `brandId` INTEGER NULL,
    `imageUrl` VARCHAR(2048) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `compareAtPrice` DECIMAL(10, 2) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `archivedAt` DATETIME(3) NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `products_status_archivedAt_displayOrder_idx`(`status`, `archivedAt`, `displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `productId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    INDEX `product_categories_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`productId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `size` VARCHAR(50) NULL,
    `inStock` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `product_variants_sku_key`(`sku`),
    INDEX `product_variants_productId_inStock_idx`(`productId`, `inStock`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260910010000_catalogue_and_commerce
-- AlterTable
ALTER TABLE `products` ADD COLUMN `currency` CHAR(3) NOT NULL DEFAULT 'AUD',
    ADD COLUMN `description` LONGTEXT NULL,
    ADD COLUMN `isWearable` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `kind` ENUM('PHYSICAL', 'BUNDLE') NOT NULL DEFAULT 'PHYSICAL',
    ADD COLUMN `policyId` INTEGER NULL,
    ADD COLUMN `primaryCategoryId` INTEGER NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `seoDescription` VARCHAR(500) NULL,
    ADD COLUMN `seoTitle` VARCHAR(255) NULL,
    ADD COLUMN `shortDescription` VARCHAR(500) NULL,
    ADD COLUMN `sizeChartId` INTEGER NULL,
    ADD COLUMN `taxClass` VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN `version` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `product_categories` ADD COLUMN `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `product_variants` ADD COLUMN `archivedAt` DATETIME(3) NULL,
    ADD COLUMN `barcode` VARCHAR(100) NULL,
    ADD COLUMN `compareAtPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN `heightMm` INTEGER UNSIGNED NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lengthMm` INTEGER UNSIGNED NULL,
    ADD COLUMN `manufacturerPartNumber` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(255) NULL,
    ADD COLUMN `optionSignature` VARCHAR(191) NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `weightGrams` INTEGER UNSIGNED NULL,
    ADD COLUMN `widthMm` INTEGER UNSIGNED NULL;

-- CreateTable
CREATE TABLE `attribute_definitions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `unit` VARCHAR(30) NULL,

    UNIQUE INDEX `attribute_definitions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute_values` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attributeId` INTEGER NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `numericValue` DECIMAL(12, 4) NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `attribute_values_attributeId_code_key`(`attributeId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_filters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `kind` ENUM('BRAND', 'AVAILABILITY', 'PRICE', 'OPTION', 'ATTRIBUTE') NOT NULL,
    `attributeId` INTEGER NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `category_filters_categoryId_code_key`(`categoryId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attributes` (
    `productId` INTEGER NOT NULL,
    `valueId` INTEGER NOT NULL,

    INDEX `product_attributes_valueId_idx`(`valueId`),
    PRIMARY KEY (`productId`, `valueId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `attributeId` INTEGER NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `product_options_productId_attributeId_key`(`productId`, `attributeId`),
    UNIQUE INDEX `product_options_id_productId_key`(`id`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_option_values` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `optionId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `swatchHex` CHAR(7) NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `product_option_values_optionId_code_key`(`optionId`, `code`),
    UNIQUE INDEX `product_option_values_id_optionId_productId_key`(`id`, `optionId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variant_options` (
    `variantId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `optionId` INTEGER NOT NULL,
    `valueId` INTEGER NOT NULL,

    PRIMARY KEY (`variantId`, `optionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_media` (
    `variantId` INTEGER NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `assetId` INTEGER NOT NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `altText` VARCHAR(500) NULL,

    INDEX `product_media_productId_displayOrder_idx`(`productId`, `displayOrder`),
    UNIQUE INDEX `product_media_productId_assetId_key`(`productId`, `assetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NULL,
    `bullets` JSON NULL,
    `videoUrl` VARCHAR(2048) NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `product_sections_productId_displayOrder_idx`(`productId`, `displayOrder`),
    UNIQUE INDEX `product_sections_productId_code_key`(`productId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `size_charts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'cm',
    `instructions` TEXT NULL,
    `measurements` JSON NOT NULL,
    `version` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_policies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shippingText` TEXT NOT NULL,
    `returnsText` TEXT NOT NULL,
    `warrantyText` TEXT NULL,
    `returnDays` SMALLINT UNSIGNED NULL,
    `version` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `store_policies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_relations` (
    `sourceId` INTEGER NOT NULL,
    `targetId` INTEGER NOT NULL,
    `kind` ENUM('COLOUR_ALTERNATIVE', 'ESSENTIAL', 'ACCESSORY', 'SIMILAR') NOT NULL,
    `displayOrder` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `product_relations_targetId_idx`(`targetId`),
    PRIMARY KEY (`sourceId`, `targetId`, `kind`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motorcycle_makes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `motorcycle_makes_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motorcycle_models` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `makeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `motorcycle_models_makeId_name_key`(`makeId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motorcycle_years` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelId` INTEGER NOT NULL,
    `year` SMALLINT UNSIGNED NOT NULL,

    UNIQUE INDEX `motorcycle_years_modelId_year_key`(`modelId`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_fitments` (
    `productId` INTEGER NOT NULL,
    `motorcycleYearId` INTEGER NOT NULL,
    `note` VARCHAR(500) NULL,

    INDEX `product_fitments_motorcycleYearId_idx`(`motorcycleYearId`),
    PRIMARY KEY (`productId`, `motorcycleYearId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` JSON NULL,
    `timezone` VARCHAR(100) NOT NULL DEFAULT 'Australia/Sydney',
    `fulfillsOnline` BOOLEAN NOT NULL DEFAULT false,
    `offersPickup` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `stock_locations_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_balances` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `variantId` INTEGER NOT NULL,
    `locationId` INTEGER NOT NULL,
    `onHand` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `reserved` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `safetyStock` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `version` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `inventory_balances_locationId_idx`(`locationId`),
    UNIQUE INDEX `inventory_balances_variantId_locationId_key`(`variantId`, `locationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_movements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryId` INTEGER NOT NULL,
    `delta` INTEGER NOT NULL,
    `reason` VARCHAR(100) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `actorId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inventory_movements_reference_key`(`reference`),
    INDEX `inventory_movements_inventoryId_createdAt_idx`(`inventoryId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryId` INTEGER NOT NULL,
    `orderItemId` INTEGER NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('ACTIVE', 'CONSUMED', 'RELEASED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `stock_reservations_status_expiresAt_idx`(`status`, `expiresAt`),
    UNIQUE INDEX `stock_reservations_inventoryId_orderItemId_key`(`inventoryId`, `orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bundle_components` (
    `bundleVariantId` INTEGER NOT NULL,
    `componentVariantId` INTEGER NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `bundle_components_componentVariantId_idx`(`componentVariantId`),
    PRIMARY KEY (`bundleVariantId`, `componentVariantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `disabledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_publicId_key`(`publicId`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `permissions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,

    INDEX `user_roles_roleId_idx`(`roleId`),
    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    INDEX `role_permissions_permissionId_idx`(`permissionId`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actorId` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(100) NOT NULL,
    `changes` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_events_entityType_entityId_createdAt_idx`(`entityType`, `entityId`, `createdAt`),
    INDEX `audit_events_actorId_createdAt_idx`(`actorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_motorcycles` (
    `userId` INTEGER NOT NULL,
    `motorcycleYearId` INTEGER NOT NULL,
    `nickname` VARCHAR(100) NULL,

    INDEX `customer_motorcycles_motorcycleYearId_idx`(`motorcycleYearId`),
    PRIMARY KEY (`userId`, `motorcycleYearId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wishlist_items_productId_idx`(`productId`),
    PRIMARY KEY (`userId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `moderatedAt` DATETIME(3) NULL,
    `moderationNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reviews_productId_status_createdAt_idx`(`productId`, `status`, `createdAt`),
    UNIQUE INDEX `reviews_productId_userId_key`(`productId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `userId` INTEGER NULL,
    `guestTokenHash` CHAR(64) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carts_publicId_key`(`publicId`),
    UNIQUE INDEX `carts_guestTokenHash_key`(`guestTokenHash`),
    INDEX `carts_userId_idx`(`userId`),
    INDEX `carts_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `cartId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,

    INDEX `cart_items_variantId_idx`(`variantId`),
    PRIMARY KEY (`cartId`, `variantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(30) NOT NULL,
    `number` VARCHAR(50) NOT NULL,
    `checkoutKey` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `currency` CHAR(3) NOT NULL DEFAULT 'AUD',
    `shippingAddress` JSON NOT NULL,
    `billingAddress` JSON NOT NULL,
    `shippingMethod` VARCHAR(191) NOT NULL,
    `policySnapshot` JSON NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `discountTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `shippingTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `taxTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(12, 2) NOT NULL,
    `placedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_publicId_key`(`publicId`),
    UNIQUE INDEX `orders_number_key`(`number`),
    UNIQUE INDEX `orders_checkoutKey_key`(`checkoutKey`),
    INDEX `orders_userId_placedAt_idx`(`userId`, `placedAt`),
    INDEX `orders_status_placedAt_idx`(`status`, `placedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `productName` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `optionsSnapshot` JSON NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `discountTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `taxTotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `lineTotal` DECIMAL(12, 2) NOT NULL,

    INDEX `order_items_variantId_idx`(`variantId`),
    UNIQUE INDEX `order_items_id_orderId_key`(`id`, `orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `providerReference` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_idempotencyKey_key`(`idempotencyKey`),
    INDEX `payments_orderId_status_idx`(`orderId`, `status`),
    UNIQUE INDEX `payments_provider_providerReference_key`(`provider`, `providerReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `providerReference` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `refunds_idempotencyKey_key`(`idempotencyKey`),
    UNIQUE INDEX `refunds_paymentId_providerReference_key`(`paymentId`, `providerReference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `carrier` VARCHAR(100) NOT NULL,
    `trackingNumber` VARCHAR(191) NULL,
    `shippedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,

    INDEX `shipments_orderId_idx`(`orderId`),
    UNIQUE INDEX `shipments_id_orderId_key`(`id`, `orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_items` (
    `shipmentId` INTEGER NOT NULL,
    `orderItemId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`shipmentId`, `orderItemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `visitorHash` CHAR(64) NOT NULL,
    `helpful` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `product_feedback_productId_visitorHash_key`(`productId`, `visitorHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `product_variants_barcode_key` ON `product_variants`(`barcode`);

-- CreateIndex
CREATE UNIQUE INDEX `product_variants_productId_optionSignature_key` ON `product_variants`(`productId`, `optionSignature`);

-- CreateIndex
CREATE UNIQUE INDEX `product_variants_id_productId_key` ON `product_variants`(`id`, `productId`);

-- AddForeignKey
ALTER TABLE `attribute_values` ADD CONSTRAINT `attribute_values_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `attribute_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_filters` ADD CONSTRAINT `category_filters_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_filters` ADD CONSTRAINT `category_filters_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `attribute_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attributes` ADD CONSTRAINT `product_attributes_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attributes` ADD CONSTRAINT `product_attributes_valueId_fkey` FOREIGN KEY (`valueId`) REFERENCES `attribute_values`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_options` ADD CONSTRAINT `product_options_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_options` ADD CONSTRAINT `product_options_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `attribute_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_option_values` ADD CONSTRAINT `product_option_values_optionId_productId_fkey` FOREIGN KEY (`optionId`, `productId`) REFERENCES `product_options`(`id`, `productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variant_options` ADD CONSTRAINT `variant_options_variantId_productId_fkey` FOREIGN KEY (`variantId`, `productId`) REFERENCES `product_variants`(`id`, `productId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `variant_options` ADD CONSTRAINT `variant_options_valueId_optionId_productId_fkey` FOREIGN KEY (`valueId`, `optionId`, `productId`) REFERENCES `product_option_values`(`id`, `optionId`, `productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_variantId_productId_fkey` FOREIGN KEY (`variantId`, `productId`) REFERENCES `product_variants`(`id`, `productId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_sections` ADD CONSTRAINT `product_sections_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_relations` ADD CONSTRAINT `product_relations_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_relations` ADD CONSTRAINT `product_relations_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `motorcycle_models` ADD CONSTRAINT `motorcycle_models_makeId_fkey` FOREIGN KEY (`makeId`) REFERENCES `motorcycle_makes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `motorcycle_years` ADD CONSTRAINT `motorcycle_years_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `motorcycle_models`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_fitments` ADD CONSTRAINT `product_fitments_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_fitments` ADD CONSTRAINT `product_fitments_motorcycleYearId_fkey` FOREIGN KEY (`motorcycleYearId`) REFERENCES `motorcycle_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_balances` ADD CONSTRAINT `inventory_balances_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_balances` ADD CONSTRAINT `inventory_balances_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `stock_locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `inventory_balances`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_movements` ADD CONSTRAINT `inventory_movements_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `inventory_balances`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_reservations` ADD CONSTRAINT `stock_reservations_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_primaryCategoryId_fkey` FOREIGN KEY (`primaryCategoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_sizeChartId_fkey` FOREIGN KEY (`sizeChartId`) REFERENCES `size_charts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_policyId_fkey` FOREIGN KEY (`policyId`) REFERENCES `store_policies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bundle_components` ADD CONSTRAINT `bundle_components_bundleVariantId_fkey` FOREIGN KEY (`bundleVariantId`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bundle_components` ADD CONSTRAINT `bundle_components_componentVariantId_fkey` FOREIGN KEY (`componentVariantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_motorcycles` ADD CONSTRAINT `customer_motorcycles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_motorcycles` ADD CONSTRAINT `customer_motorcycles_motorcycleYearId_fkey` FOREIGN KEY (`motorcycleYearId`) REFERENCES `motorcycle_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `shipment_items_shipmentId_orderId_fkey` FOREIGN KEY (`shipmentId`, `orderId`) REFERENCES `shipments`(`id`, `orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `shipment_items_orderItemId_orderId_fkey` FOREIGN KEY (`orderItemId`, `orderId`) REFERENCES `order_items`(`id`, `orderId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_feedback` ADD CONSTRAINT `product_feedback_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260910020000_commerce_constraints
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


-- Migration: 20260911000000_admin_sessions
-- CreateTable
CREATE TABLE `admin_sessions` (
    `tokenHash` CHAR(64) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_sessions_userId_idx`(`userId`),
    INDEX `admin_sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`tokenHash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_login_attempts` (
    `key` CHAR(64) NOT NULL,
    `attempts` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `windowStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_sessions` ADD CONSTRAINT `admin_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260912000000_customer_sessions
CREATE TABLE `customer_sessions` (
  `tokenHash` CHAR(64) NOT NULL,
  `userId` INTEGER NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`tokenHash`),
  INDEX `customer_sessions_userId_idx` (`userId`),
  INDEX `customer_sessions_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `customer_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `customer_auth_attempts` (
  `key` CHAR(64) NOT NULL,
  `attempts` INTEGER UNSIGNED NOT NULL DEFAULT 0,
  `windowStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Migration: 20260912010000_manual_checkout
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
