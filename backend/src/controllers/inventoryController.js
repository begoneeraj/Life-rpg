'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { SLOT_FIELD_BY_CATEGORY } = require('../services/itemGrants');

async function listInventory(req, res) {
  const character = await prisma.character.findUnique({
    where: { userId: req.userId },
    include: { inventory: { include: { item: true } } },
  });
  if (!character) {
    throw new ApiError(404, 'Character not found');
  }

  const equippedIds = new Set(
    [
      character.equippedTop,
      character.equippedBottom,
      character.equippedShoes,
      character.equippedAccessory,
      character.equippedSpecial,
    ].filter(Boolean)
  );

  res.json({
    items: character.inventory.map((inv) => ({
      ...inv.item,
      purchasedAt: inv.purchasedAt,
      equipped: equippedIds.has(inv.itemId),
    })),
  });
}

async function setEquipped(req, res, { equip }) {
  const { itemId } = req.params;

  const owned = await prisma.inventoryItem.findUnique({
    where: { userId_itemId: { userId: req.userId, itemId } },
    include: { item: true },
  });
  if (!owned) {
    throw new ApiError(404, 'You do not own this item');
  }

  const slotField = SLOT_FIELD_BY_CATEGORY[owned.item.category];
  if (!slotField) {
    throw new ApiError(400, 'This item cannot be equipped/unequipped');
  }

  const character = await prisma.character.update({
    where: { userId: req.userId },
    data: { [slotField]: equip ? itemId : null },
  });

  res.json({ character });
}

const equipItem = (req, res) => setEquipped(req, res, { equip: true });
const unequipItem = (req, res) => setEquipped(req, res, { equip: false });

module.exports = { listInventory, equipItem, unequipItem };
