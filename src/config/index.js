import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Databricks Configuration
  databricks: {
    host: process.env.DATABRICKS_HOST || 'your-workspace.cloud.databricks.com',
    path: process.env.DATABRICKS_SQL_WAREHOUSE_PATH || '/sql/1.0/warehouses/your_warehouse_id',
    token: process.env.DATABRICKS_TOKEN || '',
    catalog: process.env.DATABRICKS_CATALOG || 'main',
    schema: process.env.DATABRICKS_SCHEMA || 'tirthlok',
  },

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  uploadDir: path.join(__dirname, '../uploads'),

  // Mapbox
  mapboxToken: process.env.MAPBOX_TOKEN || '',
}

export default config
