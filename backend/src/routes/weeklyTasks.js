'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const weeklyTaskController = require('../controllers/weeklyTaskController');

const router = express.Router();
router.use(requireAuth);

router.get('/', asyncHandler(weeklyTaskController.listWeeklyTasks));
router.post('/', asyncHandler(weeklyTaskController.createWeeklyTask));
router.patch('/:id', asyncHandler(weeklyTaskController.updateWeeklyTask));
router.delete('/:id', asyncHandler(weeklyTaskController.deleteWeeklyTask));
router.post('/:id/toggle', asyncHandler(weeklyTaskController.toggleCompletionToday));

module.exports = router;
