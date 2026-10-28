// Async Postgres access. Production / Vercel: Supabase via DATABASE_URL (node-postgres).
// Local dev with no DATABASE_URL: an in-process Postgres (PGlite) persisted under data/pgdata.
const fs = require('node:fs');
const path = require('node:path');
const SCHEMA = require('./schema');
const { DEFAULTS, SAMPLE_MENU } = require('./seed');

let client, readyPromise;

function connect() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = require('pg');
    const local = /@(localhost|127\.0\.0\.1)/.test(url);
    // Supabase's pooler presents a certificate chain Node does not trust by default; the connection is still encrypted.
    const pool = new Pool({ connectionString: url, max: +process.env.PG_POOL_MAX || 3, idleTimeoutMillis: 10000, ssl: local ? false : { rejectUnauthorized: false } });
    pool.on('error', e => console.error('pg pool error', e.message));
    client = { kind: 'pg', query: (s, p) => pool.query(s, p), exec: s => pool.query(s) };
  } else {
    if (process.env.VERCEL) throw new Error('DATABASE_URL is not set. Add your Supabase connection string in Vercel environment variables.');
    const mod = '@electric-sql/pglite'; // indirect require: keeps this dev-only dependency out of the Vercel bundle
    const { PGlite } = require(mod);
    const dir = path.join(__dirname, '..', 'data', 'pgdata');
    fs.mkdirSync(dir, { recursive: true });
    const lite = new PGlite(dir);
    client = { kind: 'pglite', query: (s, p) => lite.query(s, p), exec: s => lite.exec(s) };
  }
  return client;
}

async function init() {
  const c = connect();
  await c.exec(SCHEMA);
  for (const [k, v] of Object.entries(DEFAULTS))
    await c.query('INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT (key) DO NOTHING', [k, v]);
  const n = (await c.query('SELECT COUNT(*)::int c FROM menu_items')).rows[0].c;
  if (n === 0) {
    for (let i = 0; i < SAMPLE_MENU.length; i++) {
      const s = SAMPLE_MENU[i];
      await c.query('INSERT INTO menu_items(kind,category,name,name_hi,name_ml,description,price,veg,sort) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [...s, i]);
    }
  }
}

// Runs the schema once per cold start if the database is empty. Use `npm run db:init` to do it ahead of time.
function ready() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const c = connect();
      const r = await c.query("SELECT to_regclass('public.wa_seen') AS t");
      if (!r.rows[0].t) await init();
    })().catch(e => { readyPromise = null; throw e; });
  }
  return readyPromise;
}

const all = async (sql, params = []) => { await ready(); return (await connect().query(sql, params)).rows; };
const get = async (sql, params = []) => (await all(sql, params))[0];
const run = async (sql, params = []) => { await ready(); return connect().query(sql, params); };
// INSERT ... RETURNING id -> id
const insert = async (sql, params = []) => (await get(sql + ' RETURNING id', params)).id;

// Bumped on menu/settings changes so polling clients know to reload them.
const bump = () => run("INSERT INTO settings(key,value) VALUES('version',$1) ON CONFLICT (key) DO UPDATE SET value=excluded.value", [String(Date.now())]);

module.exports = { all, get, run, insert, bump, init, connect, kind: () => connect().kind };
