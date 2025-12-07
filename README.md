# TirthLok Backend - Node.js Setup Guide

## Overview

This is a Node.js/Express.js backend for the TirthLok Jain pilgrimage explorer application. It provides RESTful APIs for managing Tirth (temples), Dharamshala (accommodations), Bhojanshala (restaurants), user authentication, and room bookings.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB 5.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Built-in middleware
- **Error Handling**: Centralized error handler

## Prerequisites

Before setting up the backend, ensure you have:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **npm** or **yarn** package manager

## Installation

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/tirthlok

# For MongoDB Atlas (Cloud):
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/tirthlok

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration (Frontend URL)
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880

# Optional
MAPBOX_TOKEN=your_mapbox_token
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB

```bash
# Start MongoDB service (macOS with Homebrew)
brew services start mongodb-community

# Or start MongoDB manually
mongod

# Verify connection
mongo
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_ATLAS_URI` in `.env`

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### Production Mode

```bash
npm start
```

## Database Seeding

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- **2 Tirth** (temples) - Palitana, Shatrunjaya
- **2 Dharamshala** (accommodations) - Divine Residency, Pilgrims Haven
- **2 Bhojanshala** (restaurants) - Sattvic Bhojan, Annapurna Kitchen
- **2 Users**:
  - Admin: `admin@tirthlok.com` / `admin123`
  - Regular User: `user@tirthlok.com` / `user123`

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check
```
GET /health
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/profile` | Get user profile (Auth required) |
| PUT | `/auth/profile` | Update user profile (Auth required) |

### Tirth (Temples) Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tirth` | Get all tirths (paginated) |
| GET | `/tirth/:id` | Get tirth by ID |
| POST | `/tirth` | Create tirth (Admin only) |
| PUT | `/tirth/:id` | Update tirth (Admin only) |
| DELETE | `/tirth/:id` | Delete tirth (Admin only) |

### Dharamshala (Accommodations) Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dharamshala` | Get all dharamshalas |
| GET | `/dharamshala/:id` | Get dharamshala by ID |
| GET | `/dharamshala/:id/rooms` | Get rooms in dharamshala |
| POST | `/dharamshala` | Create dharamshala (Admin only) |
| PUT | `/dharamshala/:id` | Update dharamshala (Admin only) |
| DELETE | `/dharamshala/:id` | Delete dharamshala (Admin only) |

### Bhojanshala (Restaurants) Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bhojanshala` | Get all bhojanshalas |
| GET | `/bhojanshala/:id` | Get bhojanshala by ID |
| POST | `/bhojanshala` | Create bhojanshala (Admin only) |
| PUT | `/bhojanshala/:id` | Update bhojanshala (Admin only) |
| DELETE | `/bhojanshala/:id` | Delete bhojanshala (Admin only) |

### Favorites Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/favorites` | Get user favorites (Auth required) |
| POST | `/favorites` | Add favorite (Auth required) |
| DELETE | `/favorites/:entityId` | Remove favorite (Auth required) |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get all bookings (Admin only) |
| GET | `/bookings/user` | Get user bookings (Auth required) |
| GET | `/bookings/:id` | Get booking by ID (Auth required) |
| POST | `/bookings` | Create booking (Auth required) |
| PUT | `/bookings/:id` | Update booking (Auth required) |
| PATCH | `/bookings/:id/cancel` | Cancel booking (Auth required) |

## Usage Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get All Tirths (with Pagination)

```bash
curl -X GET "http://localhost:5000/api/v1/tirth?page=1&limit=10&sect=Shwetambar"
```

### Get Tirth Detail

```bash
curl -X GET http://localhost:5000/api/v1/tirth/TIRTH_ID
```

### Add to Favorites (Authenticated)

```bash
curl -X POST http://localhost:5000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "TIRTH_ID",
    "entityType": "tirth"
  }'
```

### Create Booking (Authenticated)

```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dharamshalaId": "DHARAMSHALA_ID",
    "roomId": "ROOM_ID",
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-20",
    "numberOfGuests": 2,
    "totalPrice": 4000,
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestPhone": "+91-9876543210"
  }'
```

## Connecting Frontend to Backend

Update your Nuxt frontend configuration to use the backend API:

### Edit `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
    },
  },
  // ... rest of config
})
```

### Create `.env` in frontend directory

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### Update API Composables

Replace the mock API calls with backend calls:

```typescript
// src/composables/api/useTirthApi.ts
export const useTirthApi = () => {
  const config = useRuntimeConfig()
  
  const getAll = async (params = {}) => {
    return await $fetch(`${config.public.apiBaseUrl}/tirth`, {
      params,
    })
  }

  const getById = async (id) => {
    return await $fetch(`${config.public.apiBaseUrl}/tirth/${id}`)
  }

  return { getAll, getById }
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js          # Configuration from env
│   │   └── database.js       # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Global error handling
│   ├── models/
│   │   ├── Tirth.js
│   │   ├── Dharamshala.js
│   │   ├── Bhojanshala.js
│   │   ├── User.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── tirth.js          # Tirth controllers
│   │   ├── dharamshala.js    # Dharamshala controllers
│   │   ├── bhojanshala.js    # Bhojanshala controllers
│   │   ├── auth.js           # Auth & user controllers
│   │   └── booking.js        # Booking controllers
│   ├── scripts/
│   │   └── seed.js           # Database seeding
│   ├── utils/
│   │   ├── errors.js         # Custom error classes
│   │   └── helpers.js        # Utility functions
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── .env.example              # Example env variables
├── .gitignore
├── package.json
└── README.md
```

## Database Models

### Tirth (Temple)
- Basic info: name, description, location, images
- Religious: sect, type, foundingYear, acharya
- Details: festivals, facilities, timings, rules
- Engagement: rating, reviews

### Dharamshala (Accommodation)
- Basic info: name, location, contact
- Facilities: rooms, amenities, check-in/out times
- Engagement: rating, reviews

### Bhojanshala (Restaurant)
- Basic info: name, location, contact, cuisine
- Menu items with prices and vegetarian status
- Seating capacity and reservation info

### User
- Email, name, hashed password
- Favorites array (entity references)
- Profile: bio, avatar, sect
- Admin flag for access control

### Booking
- User and dharamshala references
- Dates, number of guests, total price
- Status: pending, confirmed, cancelled, completed
- Guest information

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

## Development Tips

### Enable Debug Logs

```bash
DEBUG=* npm run dev
```

### MongoDB Connection Issues

```bash
# Test local MongoDB connection
mongo mongodb://localhost:27017/tirthlok

# Or with MongoDB CLI
mongosh "mongodb://localhost:27017"
```

### JWT Token Debugging

Decode JWT tokens at [jwt.io](https://jwt.io)

## Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas URI
heroku config:set MONGODB_ATLAS_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your_production_secret"

# Deploy
git push heroku main
```

### Deploy to Railway.app

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### Deploy to DigitalOcean

See [DigitalOcean Node.js deployment guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Error

- Check if MongoDB service is running
- Verify connection string in `.env`
- For Atlas: whitelist your IP address

### CORS Errors

- Update `CORS_ORIGIN` in `.env` to match frontend URL
- Ensure credentials are sent correctly from frontend

## Support & Documentation

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [RESTful API Best Practices](https://restfulapi.net/)

## License

MIT
