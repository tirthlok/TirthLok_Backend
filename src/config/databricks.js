import pkg from '@databricks/sql'
const { DBSQLClient } = pkg
import config from './index.js'

let client = null
let session = null

export const connectDatabricks = async () => {
  try {
    console.log('🔗 Connecting to Databricks SQL Warehouse...')
    
    client = new DBSQLClient()

    await client.connect({
      token: config.databricks.token,
      host: config.databricks.host,
      path: config.databricks.path,
    })

    console.log('📂 Opening session...')
    session = await client.openSession()

    console.log('✅ Databricks SQL Connected')
    console.log(`   Host: ${config.databricks.host}`)
    console.log(`   Catalog: ${config.databricks.catalog}`)
    console.log(`   Schema: ${config.databricks.schema}`)
    return session
  } catch (error) {
    console.error(`❌ Databricks connection failed: ${error.message}`)
    throw error
  }
}

export const getConnection = () => {
  if (!session) {
    throw new Error('Databricks connection not established')
  }
  return session
}

export const disconnectDatabricks = async () => {
  try {
    if (session) {
      await session.close()
      console.log('✓ Session closed')
    }
    if (client) {
      await client.close()
      console.log('✓ Databricks disconnected')
    }
  } catch (error) {
    console.error(`✗ Databricks disconnection failed: ${error.message}`)
  }
}

// Helper function to safely replace parameters in SQL queries
const replaceParameters = (sql, params) => {
  let paramIndex = 0
  let fullSql = sql
  
  fullSql = fullSql.replace(/\?/g, () => {
    if (paramIndex >= params.length) {
      throw new Error(`Not enough parameters provided. Expected at least ${paramIndex + 1}, got ${params.length}`)
    }
    
    const param = params[paramIndex++]
    
    if (typeof param === 'string') {
      const escapedParam = param.replace(/'/g, "''")
      return `'${escapedParam}'`
    } else if (typeof param === 'number') {
      return param.toString()
    } else if (param === null) {
      return 'NULL'
    } else if (typeof param === 'boolean') {
      return param ? 'TRUE' : 'FALSE'
    } else {
      throw new Error(`Unsupported parameter type: ${typeof param}`)
    }
  })
  
  if (paramIndex < params.length) {
    throw new Error(`Too many parameters provided. Expected ${paramIndex}, got ${params.length}`)
  }
  
  return fullSql
}

// Helper function to add catalog and schema to table names
const addCatalogAndSchema = (sql) => {
  let fullSql = sql
  fullSql = fullSql.replace(/FROM\s+(\w+)\s/gi, `FROM ${config.databricks.catalog}.${config.databricks.schema}.$1 `)
  fullSql = fullSql.replace(/JOIN\s+(\w+)\s/gi, `JOIN ${config.databricks.catalog}.${config.databricks.schema}.$1 `)
  fullSql = fullSql.replace(/INTO\s+(\w+)\s/gi, `INTO ${config.databricks.catalog}.${config.databricks.schema}.$1 `)
  return fullSql
}

export const executeQuery = async (sql, params = []) => {
  const sess = getConnection()
  try {
    let fullSql = addCatalogAndSchema(sql)
    fullSql = replaceParameters(fullSql, params)
    
    const operation = await sess.executeStatement(fullSql, { runAsync: false })
    return operation
  } catch (error) {
    console.error('Query execution error:', error.message)
    throw error
  }
}

export const fetchOne = async (sql, params = []) => {
  const sess = getConnection()
  try {
    let fullSql = addCatalogAndSchema(sql)
    fullSql = replaceParameters(fullSql, params)
    
    const operation = await sess.executeStatement(fullSql, { runAsync: false })
    const rows = await operation.fetchAll()
    await operation.close()
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('Fetch one error:', error.message)
    throw error
  }
}

export const fetchAll = async (sql, params = []) => {
  const sess = getConnection()
  try {
    let fullSql = addCatalogAndSchema(sql)
    fullSql = replaceParameters(fullSql, params)
    
    const operation = await sess.executeStatement(fullSql, { runAsync: false })
    const rows = await operation.fetchAll()
    await operation.close()
    return rows
  } catch (error) {
    console.error('Fetch all error:', error.message)
    throw error
  }
}
