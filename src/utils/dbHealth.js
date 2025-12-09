/**
 * Database health check and column validation utilities
 */

import { fetchOne, fetchAll, countDocuments } from '../config/database.js'
import { getSupabaseClient } from '../config/supabase.js'

/**
 * Check database connection health
 * @returns {Promise<Object>} Health status
 */
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now()
    
    // Test connection by fetching count from users table
    const count = await countDocuments('users', {})
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      responseTime,
      message: 'Database connection is active',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Get table metadata from Supabase
 * @param {string} tableName - Table name
 * @returns {Promise<Array>} Array of column info
 */
export const getTableColumns = async (tableName) => {
  try {
    const client = getSupabaseClient()
    
    // Fetch table schema information from information_schema
    const { data, error } = await client.rpc('get_table_columns', {
      table_name: tableName,
    })
    
    if (error) {
      console.error(`Failed to get columns for ${tableName}:`, error.message)
      return null
    }
    
    return data
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error.message)
    return null
  }
}

/**
 * Validate that required columns exist in table
 * @param {string} tableName - Table name
 * @param {Array<string>} requiredColumns - Required column names
 * @returns {Promise<Object>} Validation result
 */
export const validateTableColumns = async (tableName, requiredColumns) => {
  const columns = await getTableColumns(tableName)
  
  if (!columns) {
    return {
      isValid: false,
      missing: requiredColumns,
      error: `Could not fetch columns for table ${tableName}`,
    }
  }
  
  const columnNames = columns.map(col => col.column_name)
  const missing = requiredColumns.filter(col => !columnNames.includes(col))
  
  return {
    isValid: missing.length === 0,
    missing,
    found: columnNames,
    columns,
  }
}

/**
 * Check table existence
 * @param {string} tableName - Table name
 * @returns {Promise<boolean>} true if table exists
 */
export const tableExists = async (tableName) => {
  try {
    await fetchOne(tableName, {})
    return true
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return false
    }
    return false // If any error occurs, assume table doesn't exist
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const tables = [
      'tirth_cards',
      'users',
      'dharamshalas',
      'bhojanshalas',
      'bookings',
      'favorites',
    ]
    
    const stats = {}
    
    for (const table of tables) {
      try {
        const exists = await tableExists(table)
        if (exists) {
          const count = await countDocuments(table, {})
          stats[table] = count || 0
        }
      } catch {
        stats[table] = 'error'
      }
    }
    
    return {
      database: 'supabase',
      tables: stats,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Validate column value against its type
 * @param {any} value - Value to validate
 * @param {string} type - Column data type
 * @returns {boolean} true if value is valid for type
 */
export const validateColumnType = (value, type) => {
  if (value === null) {
    return true // NULL is generally allowed unless NOT NULL constraint
  }
  
  const typeUpper = type.toUpperCase()
  
  if (typeUpper.includes('INT')) {
    return typeof value === 'number' && Number.isInteger(value)
  }
  
  if (typeUpper.includes('TEXT') || typeUpper.includes('VARCHAR')) {
    return typeof value === 'string'
  }
  
  if (typeUpper.includes('NUMERIC') || typeUpper.includes('FLOAT')) {
    return typeof value === 'number'
  }
  
  if (typeUpper.includes('BOOLEAN')) {
    return typeof value === 'boolean'
  }
  
  if (typeUpper.includes('DATE') || typeUpper.includes('TIMESTAMP')) {
    return value instanceof Date || typeof value === 'string'
  }
  
  if (typeUpper.includes('JSONB') || typeUpper.includes('JSON')) {
    return typeof value === 'object' || typeof value === 'string'
  }
  
  return true // Unknown type, skip validation
}
