import AppError from '../utils/errors.js'

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'Internal Server Error'

  // Log the full error for debugging
  console.error('🔴 Error Details:', {
    message: err.message,
    code: err.code,
    hint: err.hint,
    details: err.details,
    stack: err.stack
  })

  // Supabase/PostgreSQL error
  if (err.message && (err.message.includes('PostgreSQL') || err.message.includes('Database') || err.code)) {
    const message = `Database error occurred: ${err.message}`
    err = new AppError(message, 500)
  }

  // JWT token error
  if (err.name === 'JsonWebTokenError') {
    const message = `Json Web Token is invalid, Try again`
    err = new AppError(message, 401)
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = `Json Web Token is expired, Try again`
    err = new AppError(message, 401)
  }

  // Duplicate entry error (Supabase)
  if (err.message && (err.message.includes('duplicate key') || err.code === '23505')) {
    const message = `Duplicate field value entered`
    err = new AppError(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  })
}
