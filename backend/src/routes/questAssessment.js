'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');
const { getQuestions, evaluate } = require('../controllers/questAssessmentController');

const router = express.Router();
router.use(requireAuth);

router.post('/questions', asyncHandler(getQuestions));
router.post('/evaluate', asyncHandler(evaluate));

module.exports = router;
