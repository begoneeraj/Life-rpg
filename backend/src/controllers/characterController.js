'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { xpRequiredForLevel } = require('../services/xpEngine');
const { grantStarterItems } = require('../services/itemGrants');

const GENDERS = ['male', 'female'];
const PHYSIQUE_BY_GENDER = {
  male: ['lean', 'athletic', 'heavy'],
  female: ['slender', 'athletic', 'curvy'],
};
const SKIN_TONES = ['very_light', 'light', 'medium', 'tan', 'brown', 'deep_brown'];
const FACE_TYPES_BY_GENDER = {
  male: ['sharp', 'friendly', 'mature', 'rugged'],
  female: ['elegant', 'confident', 'friendly', 'athletic'],
};
const EYE_COLORS = [
  'deep_obsidian',
  'espresso_brown',
  'hazel_amber',
  'glacial_blue',
  'emerald_sage',
  'storm_gray',
];
const HAIR_STYLES_BY_GENDER = {
  male: ['short_textured', 'fade', 'messy_medium', 'slick_back', 'curly', 'long', 'buzz_cut'],
  female: ['long_straight', 'wavy', 'curly', 'ponytail', 'bob', 'shoulder_length', 'braided'],
};
const HAIR_COLORS = ['black', 'dark_brown', 'brown', 'blonde', 'red', 'gray', 'white'];
const FACIAL_HAIR_OPTIONS = [
  'clean_shaven',
  'light_stubble',
  'medium_beard',
  'full_beard',
  'mustache',
  'beard_and_mustache',
];
const SKIN_DETAILS = ['none', 'freckles', 'blush', 'scar'];
const GARMENT_COLORS = [
  'slate',
  'charcoal',
  'crimson',
  'forest',
  'navy',
  'sand',
  'ivory',
  'gold',
  'obsidian',
  'royal_purple',
];
const GARMENT_SLOTS = {
  top: { primaryField: 'topPrimaryColor', accentField: 'topAccentColor' },
  bottom: { primaryField: 'bottomPrimaryColor', accentField: 'bottomAccentColor' },
  shoes: { primaryField: 'shoesPrimaryColor', accentField: 'shoesAccentColor' },
};

async function getCharacter(req, res) {
  const character = await prisma.character.findUnique({
    where: { userId: req.userId },
    include: { inventory: { include: { item: true } } },
  });
  if (!character) {
    throw new ApiError(404, 'Character not found');
  }

  const equippedIds = [
    character.equippedTop,
    character.equippedBottom,
    character.equippedShoes,
    character.equippedAccessory,
    character.equippedSpecial,
  ].filter(Boolean);
  const itemsById = new Map(character.inventory.map((inv) => [inv.itemId, inv.item]));

  res.json({
    character: {
      ...character,
      equippedItems: {
        top: itemsById.get(character.equippedTop) || null,
        bottom: itemsById.get(character.equippedBottom) || null,
        shoes: itemsById.get(character.equippedShoes) || null,
        accessory: itemsById.get(character.equippedAccessory) || null,
        special: itemsById.get(character.equippedSpecial) || null,
      },
      inventory: character.inventory.map((inv) => ({
        ...inv.item,
        equipped: equippedIds.includes(inv.itemId),
        purchasedAt: inv.purchasedAt,
      })),
    },
    xpRequiredForNextLevel: xpRequiredForLevel(character.level),
  });
}

/**
 * One-time character creation. Everything here is validated against fixed
 * allow-lists rather than trusted from the client - this endpoint (plus
 * quest completion) is the only way appearance/inventory state changes, so
 * it's an anti-cheat surface just like the economy endpoints.
 */
async function createCharacter(req, res) {
  const existing = await prisma.character.findUnique({ where: { userId: req.userId } });
  if (!existing) {
    throw new ApiError(404, 'Character not found');
  }
  if (existing.createdCharacter) {
    throw new ApiError(400, 'Character has already been created');
  }

  const { gender, physique, skinTone, faceType, eyeColor, hairStyle, hairColor, facialHair, skinDetail } =
    req.body || {};

  if (!GENDERS.includes(gender)) {
    throw new ApiError(400, `gender must be one of: ${GENDERS.join(', ')}`);
  }
  if (!PHYSIQUE_BY_GENDER[gender].includes(physique)) {
    throw new ApiError(400, `physique must be one of: ${PHYSIQUE_BY_GENDER[gender].join(', ')}`);
  }
  if (!SKIN_TONES.includes(skinTone)) {
    throw new ApiError(400, `skinTone must be one of: ${SKIN_TONES.join(', ')}`);
  }
  if (!FACE_TYPES_BY_GENDER[gender].includes(faceType)) {
    throw new ApiError(400, `faceType must be one of: ${FACE_TYPES_BY_GENDER[gender].join(', ')}`);
  }
  if (!EYE_COLORS.includes(eyeColor)) {
    throw new ApiError(400, `eyeColor must be one of: ${EYE_COLORS.join(', ')}`);
  }
  if (!HAIR_STYLES_BY_GENDER[gender].includes(hairStyle)) {
    throw new ApiError(400, `hairStyle must be one of: ${HAIR_STYLES_BY_GENDER[gender].join(', ')}`);
  }
  if (!HAIR_COLORS.includes(hairColor)) {
    throw new ApiError(400, `hairColor must be one of: ${HAIR_COLORS.join(', ')}`);
  }
  const normalizedFacialHair = gender === 'male' ? facialHair : 'clean_shaven';
  if (gender === 'male' && !FACIAL_HAIR_OPTIONS.includes(normalizedFacialHair)) {
    throw new ApiError(400, `facialHair must be one of: ${FACIAL_HAIR_OPTIONS.join(', ')}`);
  }
  const normalizedSkinDetail = skinDetail ?? 'none';
  if (!SKIN_DETAILS.includes(normalizedSkinDetail)) {
    throw new ApiError(400, `skinDetail must be one of: ${SKIN_DETAILS.join(', ')}`);
  }

  const character = await prisma.$transaction(async (tx) => {
    const equipUpdate = await grantStarterItems(tx, req.userId, gender);
    return tx.character.update({
      where: { userId: req.userId },
      data: {
        gender,
        physique,
        skinTone,
        faceType,
        eyeColor,
        hairStyle,
        hairColor,
        facialHair: normalizedFacialHair,
        skinDetail: normalizedSkinDetail,
        createdCharacter: true,
        ...equipUpdate,
      },
    });
  });

  res.status(201).json({ character });
}

/**
 * Dyes one equipment slot's primary/accent colors. Unlike appearance
 * (set once at creation), garment colors can change any time - they're
 * an override on top of whatever item currently occupies the slot, not
 * tied to a specific item instance. Passing null for either field resets
 * that channel back to the equipped item's own default color.
 */
async function updateGarmentColors(req, res) {
  const { slot, primaryColor = null, accentColor = null } = req.body || {};

  const fields = GARMENT_SLOTS[slot];
  if (!fields) {
    throw new ApiError(400, `slot must be one of: ${Object.keys(GARMENT_SLOTS).join(', ')}`);
  }
  if (primaryColor !== null && !GARMENT_COLORS.includes(primaryColor)) {
    throw new ApiError(400, `primaryColor must be one of: ${GARMENT_COLORS.join(', ')}`);
  }
  if (accentColor !== null && !GARMENT_COLORS.includes(accentColor)) {
    throw new ApiError(400, `accentColor must be one of: ${GARMENT_COLORS.join(', ')}`);
  }

  const existing = await prisma.character.findUnique({ where: { userId: req.userId } });
  if (!existing) {
    throw new ApiError(404, 'Character not found');
  }

  const character = await prisma.character.update({
    where: { userId: req.userId },
    data: {
      [fields.primaryField]: primaryColor,
      [fields.accentField]: accentColor,
    },
  });

  res.json({ character });
}

module.exports = {
  getCharacter,
  createCharacter,
  updateGarmentColors,
  GENDERS,
  PHYSIQUE_BY_GENDER,
  SKIN_TONES,
  FACE_TYPES_BY_GENDER,
  EYE_COLORS,
  HAIR_STYLES_BY_GENDER,
  HAIR_COLORS,
  FACIAL_HAIR_OPTIONS,
  SKIN_DETAILS,
  GARMENT_COLORS,
};
