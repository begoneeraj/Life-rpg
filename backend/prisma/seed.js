'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// The full RPG item catalog. Purely data-driven: adding a new item never
// requires a code change, only a new row here (plus a matching svgKey layer
// on the frontend). isStarter items are auto-granted+equipped at character
// creation (see itemGrants.grantStarterItems); price:0 non-starter items are
// free level unlocks granted automatically on level-up (grantFreeLevelUnlocks).
const ITEMS = [
  // --- Starter gear (free, granted to every new character) ---
  { name: 'Basic T-Shirt', category: 'top', rarity: 'common', price: 0, requiredLevel: 1, svgKey: 'top_basic_tee', genderScope: 'unisex', isStarter: true },
  { name: 'Basic Pants', category: 'bottom', rarity: 'common', price: 0, requiredLevel: 1, svgKey: 'bottom_basic_pants', genderScope: 'unisex', isStarter: true },
  { name: 'Basic Shoes', category: 'shoes', rarity: 'common', price: 0, requiredLevel: 1, svgKey: 'shoes_basic', genderScope: 'unisex', isStarter: true },

  // --- Tops ---
  { name: 'Hoodie', category: 'top', rarity: 'uncommon', price: 150, requiredLevel: 2, svgKey: 'top_hoodie', genderScope: 'unisex' },
  { name: 'Leather Jacket', category: 'top', rarity: 'rare', price: 400, requiredLevel: 5, svgKey: 'top_leather_jacket', genderScope: 'unisex' },
  { name: 'Cyber Jacket', category: 'top', rarity: 'epic', price: 750, requiredLevel: 10, svgKey: 'top_cyber_jacket', genderScope: 'unisex' },
  { name: 'Royal Coat', category: 'top', rarity: 'legendary', price: 1800, requiredLevel: 20, svgKey: 'top_royal_coat', genderScope: 'unisex' },

  // --- Bottoms ---
  { name: 'Jeans', category: 'bottom', rarity: 'uncommon', price: 120, requiredLevel: 2, svgKey: 'bottom_jeans', genderScope: 'unisex' },
  { name: 'Cargo Pants', category: 'bottom', rarity: 'rare', price: 350, requiredLevel: 5, svgKey: 'bottom_cargo_pants', genderScope: 'unisex' },
  { name: 'Premium Pants', category: 'bottom', rarity: 'epic', price: 700, requiredLevel: 10, svgKey: 'bottom_premium_pants', genderScope: 'unisex' },

  // --- Shoes ---
  { name: 'Running Shoes', category: 'shoes', rarity: 'uncommon', price: 100, requiredLevel: 2, svgKey: 'shoes_running', genderScope: 'unisex' },
  { name: 'Combat Boots', category: 'shoes', rarity: 'rare', price: 300, requiredLevel: 5, svgKey: 'shoes_combat_boots', genderScope: 'unisex' },
  { name: 'Premium Sneakers', category: 'shoes', rarity: 'epic', price: 650, requiredLevel: 10, svgKey: 'shoes_premium_sneakers', genderScope: 'unisex' },

  // --- Accessories ---
  { name: 'Watch', category: 'accessory', rarity: 'uncommon', price: 80, requiredLevel: 3, svgKey: 'accessory_watch', genderScope: 'unisex' },
  { name: 'Sunglasses', category: 'accessory', rarity: 'rare', price: 200, requiredLevel: 6, svgKey: 'accessory_sunglasses', genderScope: 'unisex' },
  { name: 'Necklace', category: 'accessory', rarity: 'epic', price: 500, requiredLevel: 12, svgKey: 'accessory_necklace', genderScope: 'unisex' },

  // --- Special equipment ---
  { name: 'Aura Effect', category: 'special', rarity: 'legendary', price: 2000, requiredLevel: 20, svgKey: 'special_aura', genderScope: 'unisex' },
  { name: 'Back Blade', category: 'special', rarity: 'mythic', price: 3500, requiredLevel: 30, svgKey: 'special_back_blade', genderScope: 'unisex' },

  // --- Free hairstyle unlocks (auto-granted on reaching the level, not purchasable) ---
  { name: 'Undercut', category: 'hair', rarity: 'uncommon', price: 0, requiredLevel: 5, svgKey: 'hair_undercut', genderScope: 'male' },
  { name: 'Man Bun', category: 'hair', rarity: 'rare', price: 0, requiredLevel: 10, svgKey: 'hair_man_bun', genderScope: 'male' },
  { name: 'High Ponytail', category: 'hair', rarity: 'uncommon', price: 0, requiredLevel: 5, svgKey: 'hair_high_ponytail', genderScope: 'female' },
  { name: 'Twin Braids', category: 'hair', rarity: 'rare', price: 0, requiredLevel: 10, svgKey: 'hair_twin_braids', genderScope: 'female' },
];

async function main() {
  for (const item of ITEMS) {
    const existing = await prisma.item.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.item.create({ data: item });
      console.log(`Created item: ${item.name}`);
    } else {
      console.log(`Skipping existing item: ${item.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
