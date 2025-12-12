import express from 'express'
import cors from 'cors'
import 'express-async-errors'
import config from './config/index.js'
import { fetchOne } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware, adminMiddleware } from './middleware/auth.js'
import { requestIdMiddleware, requestLogger } from './middleware/requestLogger.js'
import { generalLimiter, authLimiter, createUpdateLimiter, bookingLimiter, searchLimiter } from './middleware/rateLimit.js'
import {
  validatePaginationMiddleware,
  validateTirthInput,
  validateDharamshalaInput,
  validateBhojanshalaInput,
  validateAuthInput,
  validateBookingInput,
  sanitizeSearchInput,
} from './middleware/inputValidation.js'
import { checkDatabaseHealth, getDatabaseStats } from './utils/dbHealth.js'

// Route imports
import * as tirtController from './routes/tirth.js'
import * as dharamshalaController from './routes/dharamshala.js'
import * as bhojanshalaController from './routes/bhojanshala.js'
import * as authController from './routes/auth.js'
import * as bookingController from './routes/booking.js'

export const createApp = () => {
  const app = express()

  // Middleware - Request tracking and logging
  app.use(requestIdMiddleware)
  app.use(requestLogger)

  // Middleware - CORS and parsing
  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))

  // Middleware - Rate limiting (apply to all API routes)
  app.use('/api/v1/', generalLimiter)
  app.use('/api/v1/', createUpdateLimiter)

  // Health check with database connection validation
  app.get('/health', async (req, res) => {
    const health = await checkDatabaseHealth()
    if (health.status === 'healthy') {
      return res.json(health)
    }
    res.status(503).json(health)
  })

  // Detailed health check endpoint
  app.get('/api/v1/health', async (req, res) => {
    try {
      const [dbHealth, dbStats] = await Promise.all([
        checkDatabaseHealth(),
        getDatabaseStats(),
      ])
      
      res.json({
        status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
        health: dbHealth,
        stats: dbStats,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  })

  // API version
  app.get('/api/v1', (req, res) => {
    res.json({ version: '1.0.0', name: 'TirthLok API' })
  })

  // ===== TIRTH ROUTES =====
  app.get('/api/v1/tirth/details', tirtController.getTirthDetails)
  app.get('/api/v1/tirth/festivals-and-events', tirtController.getTirthFestivalsAndEvents)
  app.get('/api/v1/tirth', sanitizeSearchInput, validatePaginationMiddleware, tirtController.getAllTirths)
  app.get('/api/v1/tirth/:id', tirtController.getTirthById)
  app.post('/api/v1/tirth', authMiddleware, adminMiddleware, validateTirthInput, tirtController.createTirth)
  app.put('/api/v1/tirth/:id', authMiddleware, adminMiddleware, validateTirthInput, tirtController.updateTirth)
  app.delete('/api/v1/tirth/:id', authMiddleware, adminMiddleware, tirtController.deleteTirth)

  // ===== DHARAMSHALA ROUTES =====
  app.get('/api/v1/dharamshala', sanitizeSearchInput, validatePaginationMiddleware, dharamshalaController.getAllDharamshalas)
  app.get('/api/v1/dharamshala/:id', dharamshalaController.getDharamshalaById)
  app.get('/api/v1/dharamshala/:id/rooms', dharamshalaController.getDharamshalaRooms)
  app.post('/api/v1/dharamshala', authMiddleware, adminMiddleware, validateDharamshalaInput, dharamshalaController.createDharamshala)
  app.put('/api/v1/dharamshala/:id', authMiddleware, adminMiddleware, validateDharamshalaInput, dharamshalaController.updateDharamshala)
  app.delete('/api/v1/dharamshala/:id', authMiddleware, adminMiddleware, dharamshalaController.deleteDharamshala)

  // ===== BHOJANSHALA ROUTES =====
  app.get('/api/v1/bhojanshala', sanitizeSearchInput, validatePaginationMiddleware, bhojanshalaController.getAllBhojanshals)
  app.get('/api/v1/bhojanshala/:id', bhojanshalaController.getBhojanshalaById)
  app.post('/api/v1/bhojanshala', authMiddleware, adminMiddleware, validateBhojanshalaInput, bhojanshalaController.createBhojanshala)
  app.put('/api/v1/bhojanshala/:id', authMiddleware, adminMiddleware, validateBhojanshalaInput, bhojanshalaController.updateBhojanshala)
  app.delete('/api/v1/bhojanshala/:id', authMiddleware, adminMiddleware, bhojanshalaController.deleteBhojanshala)

  // ===== AUTH ROUTES (with stricter rate limiting and input validation) =====
  app.post('/api/v1/auth/register', authLimiter, validateAuthInput, authController.register)
  app.post('/api/v1/auth/login', authLimiter, validateAuthInput, authController.login)
  app.post('/api/v1/auth/logout', authMiddleware, authController.logout)
  app.get('/api/v1/auth/profile', authMiddleware, authController.getProfile)
  app.put('/api/v1/auth/profile', authMiddleware, authController.updateProfile)

  // ===== FAVORITES ROUTES =====
  app.get('/api/v1/favorites', authMiddleware, authController.getFavorites)
  app.post('/api/v1/favorites', authMiddleware, authController.addFavorite)
  app.delete('/api/v1/favorites/:entityId', authMiddleware, authController.removeFavorite)

  // ===== BOOKING ROUTES (with booking-specific rate limiting and validation) =====
  app.get('/api/v1/bookings', authMiddleware, adminMiddleware, validatePaginationMiddleware, bookingController.getAllBookings)
  app.get('/api/v1/bookings/user', authMiddleware, validatePaginationMiddleware, bookingController.getUserBookings)
  app.get('/api/v1/bookings/:id', authMiddleware, bookingController.getBookingById)
  app.post('/api/v1/bookings', authMiddleware, bookingLimiter, validateBookingInput, bookingController.createBooking)
  app.put('/api/v1/bookings/:id', authMiddleware, bookingController.updateBooking)
  app.patch('/api/v1/bookings/:id/cancel', authMiddleware, bookingController.cancelBooking)

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    })
  })

  // Error handling middleware (must be last)
  app.use(errorHandler)

  return app
}
