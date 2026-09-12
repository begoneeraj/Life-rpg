-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "skinDetail" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "topPrimaryColor" TEXT,
ADD COLUMN     "topAccentColor" TEXT,
ADD COLUMN     "bottomPrimaryColor" TEXT,
ADD COLUMN     "bottomAccentColor" TEXT,
ADD COLUMN     "shoesPrimaryColor" TEXT,
ADD COLUMN     "shoesAccentColor" TEXT;
