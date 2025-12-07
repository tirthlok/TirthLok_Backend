/**
 * Token Blacklist System for Logout
 * Stores invalidated JWT tokens with expiration times
 * In production, use Redis for better performance
 */

// Simple in-memory blacklist (for development)
// In production, replace with Redis
const tokenBlacklist = new Set()
const tokenExpirations = new Map()

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresAt - Unix timestamp when token expires
 */
export const blacklistToken = (token, expiresAt) => {
  tokenBlacklist.add(token)
  tokenExpirations.set(token, expiresAt)

  // Clean up expired tokens after expiration
  setTimeout(() => {
    tokenBlacklist.delete(token)
    tokenExpirations.delete(token)
  }, (expiresAt - Date.now()))
}

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} true if token is blacklisted
 */
export const isTokenBlacklisted = (token) => {
  if (!tokenBlacklist.has(token)) {
    return false
  }

  // Check if token has expired
  const expiresAt = tokenExpirations.get(token)
  if (expiresAt && Date.now() > expiresAt) {
    tokenBlacklist.delete(token)
    tokenExpirations.delete(token)
    return false
  }

  return true
}

/**
 * Get blacklist stats (for monitoring)
 */
export const getBlacklistStats = () => ({
  size: tokenBlacklist.size,
  expirations: tokenExpirations.size,
})

/**
 * Clear expired tokens manually (for maintenance)
 */
export const clearExpiredTokens = () => {
  const now = Date.now()
  let cleared = 0

  for (const [token, expiresAt] of tokenExpirations.entries()) {
    if (now > expiresAt) {
      tokenBlacklist.delete(token)
      tokenExpirations.delete(token)
      cleared++
    }
  }

  return cleared
}
