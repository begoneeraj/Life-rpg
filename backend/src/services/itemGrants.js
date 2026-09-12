'use strict';

/**
 * Shared logic for granting Items to a character's inventory without a
 * purchase: starter gear at character creation, and free level-gated
 * unlocks (e.g. hairstyles) as the character levels up. Both call sites
 * (characterController.createCharacter, questController.completeQuest)
 * need the same "don't grant twice" and "respect gender scope" rules.
 */

const prisma = require('./prisma');

const SLOT_FIELD_BY_CATEGORY = Object.freeze({
  top: 'equippedTop',
  bottom: 'equippedBottom',
  shoes: 'equippedShoes',
  accessory: 'equippedAccessory',
  special: 'equippedSpecial',
});

function matchesGender(item, gender) {
  return item.genderScope === 'unisex' || item.genderScope === gender;
}

/**
 * Grants every `isStarter` item matching the character's gender, creating
 * InventoryItem rows and equipping each into its slot (hair/facial_hair are
 * cosmetic-only and aren't "equipped" via a slot field - they're tracked on
 * Character.hairStyle/facialHair directly). Idempotent: safe to call only
 * once per character (guarded by createdCharacter in the controller).
 */
async function grantStarterItems(tx, userId, gender) {
  const starters = await tx.item.findMany({ where: { isStarter: true } });
  const eligible = starters.filter((item) => matchesGender(item, gender));

  if (eligible.length === 0) return {};

  await tx.inventoryItem.createMany({
    data: eligible.map((item) => ({ userId, itemId: item.id })),
    skipDuplicates: true,
  });

  const equipUpdate = {};
  for (const item of eligible) {
    const slotField = SLOT_FIELD_BY_CATEGORY[item.category];
    if (slotField) {
      equipUpdate[slotField] = item.id;
    }
  }
  return equipUpdate;
}

/**
 * Grants any free (price 0, non-starter) items the character has just
 * become eligible for by leveling up, e.g. unlockable hairstyles. Skips
 * items already owned. Does not auto-equip - the player chooses those from
 * the inventory. Returns nothing; mutates the database only.
 */
async function grantFreeLevelUnlocks(tx, userId, gender, newLevel) {
  const candidates = await tx.item.findMany({
    where: { isStarter: false, price: 0, requiredLevel: { lte: newLevel } },
  });
  const eligible = candidates.filter((item) => matchesGender(item, gender));
  if (eligible.length === 0) return;

  const owned = await tx.inventoryItem.findMany({
    where: { userId, itemId: { in: eligible.map((i) => i.id) } },
    select: { itemId: true },
  });
  const ownedIds = new Set(owned.map((o) => o.itemId));
  const toGrant = eligible.filter((item) => !ownedIds.has(item.id));
  if (toGrant.length === 0) return;

  await tx.inventoryItem.createMany({
    data: toGrant.map((item) => ({ userId, itemId: item.id })),
    skipDuplicates: true,
  });
}

module.exports = { SLOT_FIELD_BY_CATEGORY, grantStarterItems, grantFreeLevelUnlocks };
