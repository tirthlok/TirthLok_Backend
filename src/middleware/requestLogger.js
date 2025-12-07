/**
 * Request logging middleware
 * Logs incoming requests with method, path, status code, and response time
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now()

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start
    const timestamp = new Date().toISOString()
    const method = req.method
    const path = req.path
    const status = res.statusCode
    const ip = req.ip || req.connection.remoteAddress

    // Color codes for status codes
    let statusColor = ''
    if (status >= 200 && status < 300) statusColor = '✅' // Green - Success
    else if (status >= 300 && status < 400) statusColor = '↪️ ' // Redirect
    else if (status >= 400 && status < 500) statusColor = '⚠️ ' // Warn - Client error
    else if (status >= 500) statusColor = '❌' // Red - Server error

    console.log(`[${timestamp}] ${statusColor} ${method.padEnd(7)} ${path.padEnd(40)} ${status} (${duration}ms) - IP: ${ip}`)
  })

  next()
}

/**
 * Detailed request logging middleware with request ID
 */
export const detailedRequestLogger = (req, res, next) => {
  const start = Date.now()
  const requestId = req.id || 'unknown'

  // Log request details
  console.log(`[REQUEST-${requestId}] ${req.method} ${req.path}`)
  if (Object.keys(req.query).length > 0) {
    console.log(`  Query: ${JSON.stringify(req.query)}`)
  }
  if (req.body && Object.keys(req.body).length > 0) {
    const body = { ...req.body }
    // Hide sensitive fields
    if (body.password) body.password = '***'
    if (body.token) body.token = '***'
    console.log(`  Body: ${JSON.stringify(body)}`)
  }

  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[RESPONSE-${requestId}] Status: ${res.statusCode}, Duration: ${duration}ms`)
  })

  next()
}

/**
 * Request ID middleware
 * Adds a unique ID to each request for tracking
 */
import { v4 as uuidv4 } from 'uuid'

export const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4()
  res.set('X-Request-ID', req.id)
  next()
}
