const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS for frontend access
app.use(cors());

// Path to visitors.json (ensure this is a valid file path)
const visitorsFile = path.join(__dirname, 'visitors.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(visitorsFile)) {
  fs.writeFileSync(visitorsFile, '{}');
}

// Helper: Load visitor IPs
const loadVisitors = () => {
  try {
    const rawData = fs.readFileSync(visitorsFile, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    return {};
  }
};

// Helper: Save visitor IPs
const saveVisitors = (visitors) => {
  fs.writeFileSync(visitorsFile, JSON.stringify(visitors));
};

// Route: Track visitors
app.get('/track', (req, res) => {
  const visitors = loadVisitors();

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip;

  if (!visitors[ip]) {
    visitors[ip] = true;
    saveVisitors(visitors);
  }

  res.json({ totalVisitors: Object.keys(visitors).length });
});

// Start server
app.listen(PORT, () => {
  console.log(`Visitor tracker is running at http://localhost:${PORT}`);
});
