import jwt from 'jsonwebtoken'
import config from '../config/index.js'
import { UnauthorizedError } from '../utils/errors.js'
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js'

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new UnauthorizedError('No token provided')
    }

    // Check if token is blacklisted (logged out)
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: 'Token has been revoked. Please login again.',
      })
    }

    const decoded = jwt.verify(token, config.jwtSecret)
    req.user = decoded
    req.token = token // Attach token to request for logout
    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      })
    }
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    })
  }
}

export const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    })
  }
  next()
}
