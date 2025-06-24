const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const VISITORS_FILE = path.join(__dirname, 'visitors.json');

app.use(cors());

// Load or initialize visitor data
function loadVisitorData() {
    if (!fs.existsSync(VISITORS_FILE)) {
        fs.writeFileSync(VISITORS_FILE, JSON.stringify({ ips: [], count: 0 }, null, 2));
    }
    return JSON.parse(fs.readFileSync(VISITORS_FILE));
}

function saveVisitorData(data) {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify(data, null, 2));
}

// Get IP address from request
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
}

// Endpoint to track unique visitors
app.get('/track', (req, res) => {
    const ip = getClientIP(req);
    const data = loadVisitorData();

    if (!data.ips.includes(ip)) {
        data.ips.push(ip);
        data.count += 1;
        saveVisitorData(data);
        console.log(`New visitor: ${ip}`);
    } else {
        console.log(`Returning visitor: ${ip}`);
    }

    res.json({ totalVisitors: data.count });
});

app.listen(PORT, () => {
    console.log(`Visitor Tracker running on http://localhost:${PORT}`);
});
