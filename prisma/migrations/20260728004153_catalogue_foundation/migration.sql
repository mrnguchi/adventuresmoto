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
