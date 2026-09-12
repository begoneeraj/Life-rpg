'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { SLOT_FIELD_BY_CATEGORY } = require('../services/itemGrants');

const VALID_CATEGORIES = ['top', 'bottom', 'shoes', 'accessory', 'special', 'hair', 'facial_hair'];

async function listShopItems(req, res) {
  const { category } = req.query;
  if (category && !VALID_CATEGORIES.includes(category)) {
    throw new ApiError(400, `category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  const character = await prisma.character.findUnique({
    where: { userId: req.userId },
    include: { inventory: { select: { itemId: true } } },
  });
  if (!character) {
    throw new ApiError(404, 'Character not found');
  }
  const ownedIds = new Set(character.inventory.map((inv) => inv.itemId));

  const items = await prisma.item.findMany({
    where: {
      isStarter: false,
      ...(category ? { category } : {}),
      genderScope: { in: ['unisex', character.gender] },
    },
    orderBy: [{ requiredLevel: 'asc' }, { price: 'asc' }],
  });

  res.json({
    items: items.map((item) => ({
      ...item,
      owned: ownedIds.has(item.id),
      locked: character.level < item.requiredLevel,
    })),
    gold: character.gold,
    level: character.level,
  });
}

/**
 * Purchases run inside a transaction: we re-read the character's gold,
 * level, and ownership inside the transaction and re-check every condition
 * right before writing, so two concurrent buy requests can't both succeed
 * off a stale gold balance (a classic race in naive "check-then-write"
 * code). Per spec: purchasing auto-equips the item into its slot.
 */
async function buyItem(req, res) {
  const { itemId } = req.params;

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.isStarter) {
    throw new ApiError(404, 'Shop item not found');
  }

  const updatedCharacter = await prisma.$transaction(async (tx) => {
    const character = await tx.character.findUnique({
      where: { userId: req.userId },
      include: { inventory: { select: { itemId: true } } },
    });
    if (!character) {
      throw new ApiError(404, 'Character not found');
    }
    if (item.genderScope !== 'unisex' && item.genderScope !== character.gender) {
      throw new ApiError(400, 'This item is not available for your character');
    }
    if (character.inventory.some((inv) => inv.itemId === item.id)) {
      throw new ApiError(400, 'You already own this item');
    }
    if (character.level < item.requiredLevel) {
      throw new ApiError(400, `Requires level ${item.requiredLevel}`);
    }
    if (character.gold < item.price) {
      throw new ApiError(400, 'Not enough gold');
    }

    await tx.inventoryItem.create({ data: { userId: req.userId, itemId: item.id } });

    const slotField = SLOT_FIELD_BY_CATEGORY[item.category];
    return tx.character.update({
      where: { userId: req.userId },
      data: {
        gold: { decrement: item.price },
        ...(slotField ? { [slotField]: item.id } : {}),
      },
    });
  });

  res.json({ character: updatedCharacter, purchased: item });
}

module.exports = { listShopItems, buyItem, VALID_CATEGORIES };
