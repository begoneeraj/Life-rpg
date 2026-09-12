'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const requireAdmin = require('../middleware/requireAdmin');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

router.post('/login', asyncHandler(adminAuthController.login));
router.post('/logout', asyncHandler(adminAuthController.logout));
router.get('/me', requireAdmin, asyncHandler(adminAuthController.me));

module.exports = router;
