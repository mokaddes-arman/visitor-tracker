require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const UPSTASH_REST_URL = process.env.UPSTASH_REST_URL;
const UPSTASH_REST_TOKEN = process.env.UPSTASH_REST_TOKEN;

app.use(cors());

app.get('/track', async (req, res) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress;

  try {
    // Check if IP already exists in Redis
    const check = await axios.get(`${UPSTASH_REST_URL}/get/${ip}`, {
      headers: { Authorization: UPSTASH_REST_TOKEN },
    });

    if (!check.data.result) {
      // If IP not found, add it
      await axios.post(`${UPSTASH_REST_URL}/set/${ip}/1`, null, {
        headers: { Authorization: UPSTASH_REST_TOKEN },
      });

      // Increment totalVisitors counter
      await axios.post(`${UPSTASH_REST_URL}/incr/totalVisitors`, null, {
        headers: { Authorization: UPSTASH_REST_TOKEN },
      });
    }

    // Get total visitor count
    const count = await axios.get(`${UPSTASH_REST_URL}/get/totalVisitors`, {
      headers: { Authorization: UPSTASH_REST_TOKEN },
    });

    res.json({ totalVisitors: count.data.result || 1 });
  } catch (err) {
    console.error('Error tracking visitor:', err.message);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
});

app.listen(PORT, () => {
  console.log(`Redis visitor tracker running at http://localhost:${PORT}`);
});
