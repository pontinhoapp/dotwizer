-- AlterTable
ALTER TABLE "users" ADD COLUMN "pix_settlement" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "friends_matches" ADD COLUMN "cents_per_point" INTEGER;
