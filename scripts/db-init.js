// Creates tables (+ RLS) and seeds defaults in the database named by DATABASE_URL (Supabase). Safe to re-run.
const fs = require('node:fs'), path = require('node:path');
try { for (const l of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]; } } catch {}
if (!process.env.DATABASE_URL) { console.error('Set DATABASE_URL (Supabase > Project Settings > Database > Connection string) in .env first.'); process.exit(1); }
require('../lib/db').init().then(() => { console.log('Database ready.'); process.exit(0); }, e => { console.error('Failed:', e.message); process.exit(1); });
