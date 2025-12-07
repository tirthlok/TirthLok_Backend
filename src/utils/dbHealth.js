/**
 * Database health check and column validation utilities
 */

import { fetchOne, fetchAll, executeQuery } from '../config/database.js'
import config from '../config/index.js'

const { catalog, schema } = config.databricks

/**
 * Check database connection health
 * @returns {Promise<Object>} Health status
 */
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now()
    
    // Test simple query
    const result = await fetchOne('SELECT 1 as ping')
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
 * Get table metadata (columns and their types)
 * @param {string} tableName - Table name
 * @returns {Promise<Array>} Array of column info
 */
export const getTableColumns = async (tableName) => {
  try {
    // Databricks DESCRIBE command
    const result = await fetchAll(
      `DESCRIBE ${catalog}.${schema}.${tableName}`
    )
    
    return result.map(row => ({
      name: row.col_name,
      type: row.data_type,
      nullable: row.comment ? !row.comment.includes('NOT NULL') : true,
    }))
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
  
  const columnNames = columns.map(col => col.name)
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
    await fetchOne(`SELECT 1 FROM ${catalog}.${schema}.${tableName} LIMIT 1`)
    return true
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return false
    }
    throw error
  }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const tables = [
      'tirth',
      'users',
      'dharamshalas',
      'bhojanshals',
      'bookings',
      'favorites',
    ]
    
    const stats = {}
    
    for (const table of tables) {
      try {
        const exists = await tableExists(table)
        if (exists) {
          const result = await fetchOne(
            `SELECT COUNT(*) as count FROM ${catalog}.${schema}.${table}`
          )
          stats[table] = result?.count || 0
        }
      } catch {
        stats[table] = 'error'
      }
    }
    
    return {
      catalog,
      schema,
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
  
  if (typeUpper.includes('STRING') || typeUpper.includes('VARCHAR')) {
    return typeof value === 'string'
  }
  
  if (typeUpper.includes('DOUBLE') || typeUpper.includes('FLOAT')) {
    return typeof value === 'number'
  }
  
  if (typeUpper.includes('BOOLEAN')) {
    return typeof value === 'boolean'
  }
  
  if (typeUpper.includes('DATE') || typeUpper.includes('TIMESTAMP')) {
    return value instanceof Date || typeof value === 'string'
  }
  
  if (typeUpper.includes('ARRAY')) {
    return Array.isArray(value)
  }
  
  return true // Unknown type, skip validation
}
