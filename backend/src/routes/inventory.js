'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(inventoryController.listInventory));
router.post('/:itemId/equip', asyncHandler(inventoryController.equipItem));
router.post('/:itemId/unequip', asyncHandler(inventoryController.unequipItem));

module.exports = router;
