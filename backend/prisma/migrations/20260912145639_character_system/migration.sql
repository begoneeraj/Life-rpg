-- AlterTable
ALTER TABLE "Character" DROP COLUMN "creativity",
DROP COLUMN "equippedTheme",
DROP COLUMN "ownedItems",
ADD COLUMN     "createdCharacter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "energy" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "equippedAccessory" TEXT,
ADD COLUMN     "equippedBottom" TEXT,
ADD COLUMN     "equippedShoes" TEXT,
ADD COLUMN     "equippedSpecial" TEXT,
ADD COLUMN     "equippedTop" TEXT,
ADD COLUMN     "faceType" TEXT NOT NULL DEFAULT 'friendly',
ADD COLUMN     "facialHair" TEXT NOT NULL DEFAULT 'clean_shaven',
ADD COLUMN     "focus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'male',
ADD COLUMN     "hairColor" TEXT NOT NULL DEFAULT 'black',
ADD COLUMN     "hairStyle" TEXT NOT NULL DEFAULT 'short_textured',
ADD COLUMN     "skinTone" TEXT NOT NULL DEFAULT 'medium';

-- DropTable
DROP TABLE "ShopItem";

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "svgKey" TEXT NOT NULL,
    "genderScope" TEXT NOT NULL DEFAULT 'unisex',
    "isStarter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryItem_userId_idx" ON "InventoryItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_userId_itemId_key" ON "InventoryItem"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Character"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

