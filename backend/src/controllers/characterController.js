'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { xpRequiredForLevel } = require('../services/xpEngine');

async function getCharacter(req, res) {
  const character = await prisma.character.findUnique({ where: { userId: req.userId } });
  if (!character) {
    throw new ApiError(404, 'Character not found');
  }
  res.json({
    character,
    xpRequiredForNextLevel: xpRequiredForLevel(character.level),
  });
}

module.exports = { getCharacter };
