# ⚡ Quick Start - Supabase Setup

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd c:\Users\krush\Desktop\TirthLok_Backend
npm install
```

### Step 2: Create `.env` File
Create a file named `.env` in the root directory with:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://cfmvkvpyjvbcenqorifa.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmbXZrdnB5anZiY2VucW9yaWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTM0MjQsImV4cCI6MjA4MDg2OTQyNH0.lWTSNFoT9LteNnRzVXKjgbe2YORyS9275p2lYDH2bZ4
JWT_SECRET=tirthlok_secret_key_12345
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Create Database Tables
1. Go to https://app.supabase.com and login
2. Select your project: `cfmvkvpyjvbcenqorifa`
3. Navigate to **SQL Editor**
4. Copy & paste the SQL from **`SUPABASE_MIGRATION.md`** (Tables section)
5. Click **"Run"**

### Step 4: Start Server
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
```

---

## Test It Out

### Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### Health Check
```bash
curl http://localhost:5000/health
```

### Get API Version
```bash
curl http://localhost:5000/api/v1
```

---

## What's Changed

| Component | Before | After |
|-----------|--------|-------|
| Database | MongoDB | PostgreSQL (Supabase) |
| ODM | Mongoose | @supabase/supabase-js |
| Connection | Mongoose connection | Supabase client |
| Queries | SQL (Databricks) | PostgREST API |
| Tables | Collections | Relations |

---

## File Structure

```
src/
├── config/
│   ├── index.js           ← Supabase configuration
│   ├── database.js        ← Database adapter functions
│   └── supabase.js        ← Supabase client (NEW)
├── routes/
│   ├── auth.js            ← Updated for Supabase
│   ├── tirth.js           ← Updated for Supabase
│   ├── dharamshala.js     ← Updated for Supabase
│   ├── bhojanshala.js     ← Updated for Supabase
│   └── booking.js         ← Updated for Supabase
├── middleware/
│   ├── errorHandler.js    ← Updated for PostgreSQL
│   └── ...
└── utils/
    ├── dbHealth.js        ← Updated for Supabase
    └── ...
```

---

## Common Issues

**Error: "Supabase connection not established"**
- Check `.env` file has correct SUPABASE_URL and SUPABASE_ANON_KEY

**Error: "relation ... does not exist"**
- You haven't created the database tables yet
- Go to Supabase SQL Editor and run the SQL from SUPABASE_MIGRATION.md

**Duplicate key error**
- Email already exists in database
- Use a different email for testing

---

## Next Steps

- [ ] Install dependencies
- [ ] Create `.env` file
- [ ] Create database tables via Supabase SQL Editor
- [ ] Start server with `npm run dev`
- [ ] Test endpoints
- [ ] Deploy to production

---

## Documentation

- **Detailed Setup**: See `SUPABASE_SETUP.md`
- **Migration Guide**: See `SUPABASE_MIGRATION.md`
- **Supabase Docs**: https://supabase.com/docs

✅ **You're all set! Happy coding!** 🚀
