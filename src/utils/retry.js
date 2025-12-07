/**
 * Retry logic with exponential backoff for database operations
 * Handles transient failures and connection timeouts
 */

export const retryOperation = async (
  operation,
  maxRetries = 3,
  initialDelayMs = 100
) => {
  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }
      
      // Don't retry on validation errors
      if (error.message && error.message.includes('validation')) {
        throw error
      }
      
      // Wait before retrying with exponential backoff
      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt)
        const jitter = Math.random() * delayMs * 0.1 // Add 10% jitter
        
        console.log(
          `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. ` +
          `Retrying in ${Math.round(delayMs + jitter)}ms. ` +
          `Error: ${error.message}`
        )
        
        await new Promise(resolve => 
          setTimeout(resolve, delayMs + jitter)
        )
      }
    }
  }
  
  throw new Error(
    `Operation failed after ${maxRetries} attempts. Last error: ${lastError.message}`
  )
}

/**
 * Execute query with retry logic
 * @param {Function} fetchFunction - executeQuery, fetchOne, or fetchAll
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise} Query result
 */
export const executeQueryWithRetry = async (
  fetchFunction,
  sql,
  params = [],
  maxRetries = 3
) => {
  return retryOperation(
    () => fetchFunction(sql, params),
    maxRetries
  )
}

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  const retryableMessages = [
    'timeout',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'temporarily unavailable',
    'try again',
  ]
  
  const errorMessage = (error.message || '').toLowerCase()
  
  return retryableMessages.some(msg => 
    errorMessage.includes(msg.toLowerCase())
  )
}
