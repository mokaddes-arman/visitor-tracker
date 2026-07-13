# Visitor Tracker API (Node.js + Turso SQLite)

This is a backend service that tracks **unique visitor counts** based on IP addresses, using [Turso](https://turso.tech) (SQLite) as the backend database. Designed to work with static sites like GitHub Pages.

Example Frontend: [mokaddes.github.io](https://mokaddes.github.io)

---

## Technologies Used

- Node.js + Express
- Turso SQLite (Cloud Database)
- CORS
- Render (deployment)

---

## How It Works

- When someone visits the portfolio site, the frontend sends a request to `/track`
- The server checks the IP address using `x-forwarded-for`
- If it's a new IP, it:
  - Stores the IP in the `visitors` table
  - Increments the `totalVisitors` counter
- The updated count is returned and shown on the site

---

## Setup Instructions (Local)

1. Clone the repo
   ```bash
   git clone https://github.com/mokaddes-arman/visitor-tracker.git
   cd visitor-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with your Turso credentials:
   ```env
   TURSO_DATABASE_URL=libsql://your-database-url
   TURSO_AUTH_TOKEN=your_auth_token_here
   PORT=3000
   ```

4. Start the server
   ```bash
   npm start
   ```

The server will initialize the database tables on startup and run on `http://localhost:3000`

---

## API Endpoints

### `GET /track`
Tracks a visitor and returns the total visitor count.

**Response:**
```json
{
  "totalVisitors": 42
}
```

---

## Deployment Instructions (Render)

1. Create a new Web Service on [https://render.com](https://render.com)

2. Connect to this repository

3. Set environment variables in the dashboard:
   - `TURSO_DATABASE_URL` - Your Turso database URL
   - `TURSO_AUTH_TOKEN` - Your Turso auth token

4. Use these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. Deploy and your visitor tracker will be live!

---

## Database Schema

### `visitors` table
Stores unique visitor IP addresses:
```sql
CREATE TABLE visitors (
  ip TEXT PRIMARY KEY
)
```

### `counters` table
Stores visitor count metrics:
```sql
CREATE TABLE counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
)
```

---

## License

ISC
