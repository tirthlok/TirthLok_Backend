import * as databricks from './databricks.js'
import config from './index.js'

export const connectDB = async () => {
  try {
    await databricks.connectDatabricks()
    console.log(`✓ Databricks Database Connected`)
    return true
  } catch (error) {
    console.error(`✗ Database connection failed: ${error.message}`)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  await databricks.disconnectDatabricks()
}

export const executeQuery = async (sql, params = []) => {
  return databricks.executeQuery(sql, params)
}

export const fetchOne = async (sql, params = []) => {
  return databricks.fetchOne(sql, params)
}

export const fetchAll = async (sql, params = []) => {
  return databricks.fetchAll(sql, params)
}
