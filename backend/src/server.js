'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const questRoutes = require('./routes/quests');
const characterRoutes = require('./routes/character');
const shopRoutes = require('./routes/shop');
const inventoryRoutes = require('./routes/inventory');
const questAnalysisRoutes = require('./routes/questAnalysis');
const questAssessmentRoutes = require('./routes/questAssessment');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // required so the browser sends/receives the httpOnly auth cookies
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'life-rpg-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analyze-quest', questAnalysisRoutes);
app.use('/api/quest-assessment', questAssessmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Life RPG backend listening on port ${PORT}`);
});

module.exports = app;
