# Supabase Migration Guide

## Overview
Your TirthLok Backend has been successfully migrated from MongoDB to **Supabase** (PostgreSQL).

## What Changed

### 1. Dependencies
- **Removed**: `mongoose` (MongoDB ODM)
- **Added**: `@supabase/supabase-js` (Supabase client)

### 2. Configuration Files
- **Deleted**: `src/config/mongodb.js`
- **Created**: `src/config/supabase.js` - Supabase client initialization and query helpers
- **Updated**: `src/config/index.js` - Now uses Supabase config
- **Updated**: `src/config/database.js` - Adapter functions for Supabase

### 3. Updated Files
All route files have been updated to use Supabase functions:
- `src/routes/auth.js`
- `src/routes/tirth.js`
- `src/routes/dharamshala.js`
- `src/routes/bhojanshala.js`
- `src/routes/booking.js`

Utility files:
- `src/utils/dbHealth.js` - Updated for Supabase
- `src/middleware/errorHandler.js` - Updated for PostgreSQL error handling

### 4. Database Functions
Available functions in `src/config/database.js`:

```javascript
// Read operations
fetchAll(table, filters, options)      // Get multiple records
fetchOne(table, filters, options)      // Get single record

// Write operations
insertOne(table, data)                 // Insert one record
insertMany(table, dataArray)           // Insert multiple records
updateOne(table, filters, updateData)  // Update one record
updateMany(table, filters, updateData) // Update multiple records
deleteOne(table, filters)              // Delete one record

// Utility operations
countDocuments(table, filters)         // Count records
executeRawQuery(sql)                   // Execute raw SQL (use carefully)
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://cfmvkvpyjvbcenqorifa.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Create Database Tables
Create these tables in your Supabase PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  sect VARCHAR(100),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tirth table
CREATE TABLE tirth (
  tirth_name VARCHAR(255) PRIMARY KEY,
  location JSONB,
  sect VARCHAR(100),
  type VARCHAR(100),
  description TEXT,
  rating DECIMAL(3,1),
  timings JSONB,
  festivals JSONB,
  facilities JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tirth details table
CREATE TABLE tirth_detail (
  id UUID PRIMARY KEY,
  tirth_name VARCHAR(255) REFERENCES tirth(tirth_name),
  detail_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dharamshalas table
CREATE TABLE dharamshalas (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location JSONB,
  facilities JSONB,
  rating DECIMAL(3,1),
  check_in_time VARCHAR(50),
  check_out_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  dharamshala_id UUID REFERENCES dharamshalas(id),
  room_type VARCHAR(100),
  capacity INTEGER,
  available_rooms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bhojanshalas table
CREATE TABLE bhojanshalas (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisine VARCHAR(100),
  speciality TEXT,
  operating_hours JSONB,
  location JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  dharamshala_id UUID REFERENCES dharamshalas(id),
  room_id UUID REFERENCES rooms(id),
  check_in_date DATE,
  check_out_date DATE,
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entity_id VARCHAR(255),
  entity_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token blacklist table (optional)
CREATE TABLE token_blacklist (
  id UUID PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_dharamshala_id ON bookings(dharamshala_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
```

### 4. Set Up Row-Level Security (RLS) Policies (Optional)
For production, enable RLS on sensitive tables:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT
  USING (auth.uid()::text = user_id::text);
```

### 5. Start Server
```bash
npm run dev
```

## Key Differences from MongoDB

### Data Types
- JSON fields use PostgreSQL's `JSONB` type instead of MongoDB documents
- UUIDs use `UUID` type instead of ObjectId
- Dates use PostgreSQL `TIMESTAMP` type

### Query Syntax
**MongoDB (Old)**:
```javascript
const user = await fetchOne(User, { email: 'user@example.com' })
```

**Supabase (New)**:
```javascript
const user = await fetchOne('users', { email: 'user@example.com' })
```

### No Implicit Joins
Supabase doesn't auto-populate foreign keys. Manual fetching is required:
```javascript
const booking = await fetchOne('bookings', { id: bookingId })
const dharamshala = await fetchOne('dharamshalas', { id: booking.dharamshala_id })
```

### Pagination
```javascript
const options = {
  limit: 10,
  offset: 0,
  orderBy: 'created_at',
  ascending: false
}
const { data, count } = await fetchAll('bookings', {}, options)
```

## API Endpoints
All existing endpoints remain the same:

```
GET    /api/v1/tirth                    - List all tirths
GET    /api/v1/tirth/:id                - Get tirth by ID
POST   /api/v1/tirth                    - Create tirth (admin)
PUT    /api/v1/tirth/:id                - Update tirth (admin)
DELETE /api/v1/tirth/:id                - Delete tirth (admin)

GET    /api/v1/dharamshala              - List all dharamshalas
GET    /api/v1/dharamshala/:id          - Get dharamshala by ID
POST   /api/v1/dharamshala              - Create dharamshala (admin)
PUT    /api/v1/dharamshala/:id          - Update dharamshala (admin)
DELETE /api/v1/dharamshala/:id          - Delete dharamshala (admin)

GET    /api/v1/bhojanshala              - List all bhojanshalas
GET    /api/v1/bhojanshala/:id          - Get bhojanshala by ID
POST   /api/v1/bhojanshala              - Create bhojanshala (admin)
PUT    /api/v1/bhojanshala/:id          - Update bhojanshala (admin)
DELETE /api/v1/bhojanshala/:id          - Delete bhojanshala (admin)

POST   /api/v1/auth/register            - Register user
POST   /api/v1/auth/login               - Login user
GET    /api/v1/auth/profile             - Get user profile
PUT    /api/v1/auth/profile             - Update user profile
POST   /api/v1/auth/logout              - Logout user

GET    /api/v1/bookings                 - List all bookings (admin)
GET    /api/v1/bookings/user            - Get user bookings
GET    /api/v1/bookings/:id             - Get booking by ID
POST   /api/v1/bookings                 - Create booking
PUT    /api/v1/bookings/:id             - Update booking
DELETE /api/v1/bookings/:id             - Cancel booking
```

## Troubleshooting

### Connection Issues
```
Error: "Supabase connection not established"
Solution: Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env
```

### Table Not Found
```
Error: "relation ... does not exist"
Solution: Create the required tables using SQL provided above
```

### JSONB Queries
For complex JSONB queries, use Supabase's PostgREST API or raw queries:
```javascript
const { data } = await fetchAll('tirth', {}, {
  select: '*'
})
// Then filter in-memory if needed
const filtered = data.filter(t => t.location.city === 'Varanasi')
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Update `.env` with Supabase credentials
3. ✅ Create database tables (SQL provided above)
4. ✅ Test endpoints with Postman or curl
5. ✅ Deploy to production with environment variables

## Support
For Supabase documentation: https://supabase.com/docs
For PostgreSQL documentation: https://www.postgresql.org/docs/
