'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const battleController = require('../controllers/battleController');

const router = express.Router();

router.use(requireAuth);

router.post('/challenge', asyncHandler(battleController.challenge));
router.post('/respond', asyncHandler(battleController.respond));
router.post('/task/complete', asyncHandler(battleController.completeTask));
router.post('/end', asyncHandler(battleController.end));
router.get('/incoming', asyncHandler(battleController.listIncoming));
router.get('/mine', asyncHandler(battleController.listMine));
router.get('/:battle_id/status', asyncHandler(battleController.getStatus));

module.exports = router;
