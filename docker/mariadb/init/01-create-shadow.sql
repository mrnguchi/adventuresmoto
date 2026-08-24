-- Prisma validates development migrations against this isolated database.
CREATE DATABASE IF NOT EXISTS `adventuresmoto_shadow`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `adventuresmoto_shadow`.* TO 'adventuresmoto'@'%';
