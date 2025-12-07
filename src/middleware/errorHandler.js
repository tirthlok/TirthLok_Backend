import AppError from '../utils/errors.js'

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'Internal Server Error'

  // Databricks/SQL error
  if (err.message && (err.message.includes('SQL') || err.message.includes('Database'))) {
    const message = `Database error occurred`
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

  // Duplicate entry error
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    const message = `Duplicate field value entered`
    err = new AppError(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  })
}
