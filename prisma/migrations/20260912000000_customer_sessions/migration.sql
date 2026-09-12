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
