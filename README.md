
# Visitor Tracker API (Node.js + Redis)

This is a backend service that tracks **unique visitor counts** based on IP addresses, using [Upstash Redis](https://upstash.com) as the backend store. Designed to work with static sites like GitHub Pages.

Example Frontend: [mokaddes.github.io](https://mokaddes.github.io)

---

## Technologies Used

- Node.js + Express
- Upstash Redis (REST API)
- Axios (for Redis requests)
- CORS
- Render (deployment)

---

## How It Works

- When someone visits the portfolio site, the frontend sends a request to `/track`
- The server checks the IP address using `x-forwarded-for`
- If it's a new IP, it:
  - Adds the IP to Redis
  - Increments the `totalVisitors` key 
- The updated count is returned and shown on the site

---
## Setup Instructions (Local)

1. Clone the repo
2. Install dependencies: npm install
3. Create a .env file:
   UPSTASH_REST_URL=https://your-db.upstash.io
   UPSTASH_REST_TOKEN=Bearer your_token_here

## Deployment Instructions (Render)

    Create a new Web Service on https://render.com

    Connect to this repo

    Set environment variables in the dashboard:

        UPSTASH_REST_URL

        UPSTASH_REST_TOKEN

    Use these settings:

        Build Command: npm install

        Start Command: node server.js
