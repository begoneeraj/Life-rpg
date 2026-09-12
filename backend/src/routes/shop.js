'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const shopController = require('../controllers/shopController');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(shopController.listShopItems));
router.post('/:itemId/buy', asyncHandler(shopController.buyItem));

module.exports = router;
