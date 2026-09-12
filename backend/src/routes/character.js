'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const characterController = require('../controllers/characterController');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(characterController.getCharacter));

module.exports = router;
