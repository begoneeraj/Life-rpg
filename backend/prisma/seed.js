'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cosmetic-only items - purely for flavor/progression feel, no gameplay power.
const SHOP_ITEMS = [
  { name: 'Ember Theme', cost: 50, type: 'theme' },
  { name: 'Frostbyte Theme', cost: 50, type: 'theme' },
  { name: 'Void Theme', cost: 120, type: 'theme' },
  { name: 'Novice Adventurer Badge', cost: 20, type: 'badge' },
  { name: 'Streak Keeper Badge', cost: 80, type: 'badge' },
  { name: 'Dragon Slayer Badge', cost: 200, type: 'badge' },
  { name: 'Rogue Avatar', cost: 100, type: 'avatar' },
  { name: 'Battlemage Avatar', cost: 150, type: 'avatar' },
  { name: 'Paladin Avatar', cost: 250, type: 'avatar' },
];

async function main() {
  for (const item of SHOP_ITEMS) {
    const existing = await prisma.shopItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.shopItem.create({ data: item });
      console.log(`Created shop item: ${item.name}`);
    } else {
      console.log(`Skipping existing shop item: ${item.name}`);
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
