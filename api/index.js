// Vercel serverless entry. vercel.json rewrites /api/* and /webhook here.
module.exports = require('../lib/app').handler;
