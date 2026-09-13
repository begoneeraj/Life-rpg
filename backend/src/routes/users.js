'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.patch('/username', requireAuth, asyncHandler(usersController.setUsername));
router.get('/:username/profile', requireAuth, asyncHandler(usersController.getProfile));

module.exports = router;
