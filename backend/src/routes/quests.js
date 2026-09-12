'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const questController = require('../controllers/questController');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(questController.listQuests));
router.post('/', asyncHandler(questController.createQuest));
router.patch('/:id/complete', asyncHandler(questController.completeQuest));
router.delete('/:id', asyncHandler(questController.deleteQuest));

module.exports = router;
