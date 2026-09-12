'use strict';

const { PrismaClient } = require('@prisma/client');

// Single shared Prisma client for the whole process. Avoids exhausting the
// Supabase connection pool by instantiating a new client per request.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
