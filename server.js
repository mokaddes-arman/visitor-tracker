require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = process.env.PORT || 3000;

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

app.use(cors());

// Run once on startup to make sure tables exist
async function initDb() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      ip TEXT PRIMARY KEY
    )
  `);
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS counters (
      name TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    )
  `);
  await turso.execute(`
    INSERT INTO counters (name, value) VALUES ('totalVisitors', 0)
    ON CONFLICT(name) DO NOTHING
  `);
}

app.get('/track', async (req, res) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress;

  try {
    const existing = await turso.execute({
      sql: 'SELECT ip FROM visitors WHERE ip = ?',
      args: [ip],
    });

    if (existing.rows.length === 0) {
      await turso.execute({
        sql: 'INSERT INTO visitors (ip) VALUES (?)',
        args: [ip],
      });
      await turso.execute(`
        UPDATE counters SET value = value + 1 WHERE name = 'totalVisitors'
      `);
    }

    const result = await turso.execute(`
      SELECT value FROM counters WHERE name = 'totalVisitors'
    `);
    const totalVisitors = result.rows[0]?.value ?? 1;

    res.setHeader('Content-Type', 'application/json');
    res.json({ totalVisitors });
  } catch (err) {
    console.error('Error tracking visitor:', err.message);
    res.status(500).setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to track visitor' });
  }
});

// Friendly root route (avoids Express's default "Cannot GET /" text)
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'Visitor tracker is running. Use /track to log a visit.' });
});

// Catch-all 404 — keeps responses small instead of Express's default HTML 404 page
app.use((req, res) => {
  res.status(404).setHeader('Content-Type', 'application/json');
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — catches anything unhandled and returns compact JSON
// instead of Express's default HTML stack-trace page
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).setHeader('Content-Type', 'application/json');
  res.status(500).json({ error: 'Internal server error' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Visitor tracker running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });
