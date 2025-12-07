import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import config from '../config/index.js'
import { executeQuery, fetchOne } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'
import { blacklistToken } from '../utils/tokenBlacklist.js'
import { executeQueryWithRetry } from '../utils/retry.js'

const { catalog, schema } = config.databricks

export const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body

    // Check if user already exists
    const existingUser = await executeQueryWithRetry(
      fetchOne,
      `SELECT id FROM ${catalog}.${schema}.users WHERE email = ?`,
      [email]
    )

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use',
      })
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10)
    const id = uuidv4()

    // Create new user
    await executeQueryWithRetry(
      executeQuery,
      `INSERT INTO ${catalog}.${schema}.users (id, email, name, password_hash, is_admin, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`,
      [id, email, name, passwordHash, false]
    )

    const user = await executeQueryWithRetry(
      fetchOne,
      `SELECT id, email, name, is_admin FROM ${catalog}.${schema}.users WHERE id = ?`,
      [id]
    )

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    )

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.is_admin,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      })
    }

    // Find user with password
    const user = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.users WHERE email = ?`,
      [email]
    )

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      })
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    )

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.is_admin,
        },
        token,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await executeQueryWithRetry(
      fetchOne,
      `SELECT id, email, name, is_admin, sect FROM ${catalog}.${schema}.users WHERE id = ?`,
      [req.user.id]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
        sect: user.sect,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, sect } = req.body
    const userId = req.user.id

    await executeQueryWithRetry(
      executeQuery,
      `UPDATE ${catalog}.${schema}.users SET name = ?, sect = ?, updated_at = CURRENT_TIMESTAMP()
       WHERE id = ?`,
      [name, sect, userId]
    )

    const user = await executeQueryWithRetry(
      fetchOne,
      `SELECT id, email, name, is_admin, sect FROM ${catalog}.${schema}.users WHERE id = ?`,
      [userId]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
        sect: user.sect,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Logout endpoint - Blacklist the token
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.token // Attached by authMiddleware
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'No token provided',
      })
    }

    // Get token expiration time
    try {
      const decoded = jwt.verify(token, config.jwtSecret, { ignoreExpiration: true })
      const expiresAt = (decoded.exp || Math.floor(Date.now() / 1000)) * 1000
      
      // Blacklist the token
      blacklistToken(token, expiresAt)
    } catch (error) {
      // Even if token is invalid, still return success
      console.warn('Token verification failed during logout:', error.message)
    }

    res.json({
      success: true,
      message: 'Logged out successfully. Token has been revoked.',
    })
  } catch (error) {
    next(error)
  }
}

export const addFavorite = async (req, res, next) => {
  try {
    const { entityId, entityType } = req.body
    const userId = req.user.id

    const id = uuidv4()
    await executeQuery(
      `INSERT INTO ${catalog}.${schema}.favorites (id, user_id, entity_id, entity_type, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP())`,
      [id, userId, entityId, entityType]
    )

    const favorites = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.favorites WHERE user_id = ?`,
      [userId]
    )

    res.json({
      success: true,
      data: favorites || [],
    })
  } catch (error) {
    next(error)
  }
}

export const removeFavorite = async (req, res, next) => {
  try {
    const { entityId } = req.params
    const userId = req.user.id

    await executeQuery(
      `DELETE FROM ${catalog}.${schema}.favorites WHERE user_id = ? AND entity_id = ?`,
      [userId, entityId]
    )

    const favorites = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.favorites WHERE user_id = ?`,
      [userId]
    )

    res.json({
      success: true,
      data: favorites || [],
    })
  } catch (error) {
    next(error)
  }
}

export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id

    const favorites = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.favorites WHERE user_id = ?`,
      [userId]
    )

    if (!favorites) {
      return res.json({
        success: true,
        data: [],
      })
    }

    res.json({
      success: true,
      data: favorites,
    })
  } catch (error) {
    next(error)
  }
}
