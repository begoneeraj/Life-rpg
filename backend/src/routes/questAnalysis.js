'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const { analyzeQuest } = require('../controllers/questAnalysisController');

const router = express.Router();
router.use(requireAuth);

router.post('/', asyncHandler(analyzeQuest));

module.exports = router;
