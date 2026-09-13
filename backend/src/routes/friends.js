'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const friendsController = require('../controllers/friendsController');

const router = express.Router();

router.use(requireAuth);

router.post('/request', asyncHandler(friendsController.sendRequest));
router.post('/respond', asyncHandler(friendsController.respond));
router.get('/list', asyncHandler(friendsController.list));
router.get('/requests/incoming', asyncHandler(friendsController.incomingRequests));
router.get('/leaderboard', asyncHandler(friendsController.leaderboard));

module.exports = router;
