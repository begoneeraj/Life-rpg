'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');

async function listShopItems(req, res) {
  const items = await prisma.shopItem.findMany({ orderBy: { cost: 'asc' } });
  res.json({ items });
}

/**
 * Purchases run inside a transaction: we re-read the character's gold and
 * ownedItems inside the transaction and re-check both conditions right
 * before writing, so two concurrent buy requests can't both succeed off a
 * stale gold balance (a classic race in naive "check-then-write" code).
 */
async function buyItem(req, res) {
  const { itemId } = req.params;

  const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
  if (!item) {
    throw new ApiError(404, 'Shop item not found');
  }

  const updatedCharacter = await prisma.$transaction(async (tx) => {
    const character = await tx.character.findUnique({ where: { userId: req.userId } });
    if (!character) {
      throw new ApiError(404, 'Character not found');
    }
    if (character.ownedItems.includes(item.id)) {
      throw new ApiError(400, 'You already own this item');
    }
    if (character.gold < item.cost) {
      throw new ApiError(400, 'Not enough gold');
    }

    return tx.character.update({
      where: { userId: req.userId },
      data: {
        gold: { decrement: item.cost },
        ownedItems: { push: item.id },
      },
    });
  });

  res.json({ character: updatedCharacter, purchased: item });
}

module.exports = { listShopItems, buyItem };
