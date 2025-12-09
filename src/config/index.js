import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://cfmvkvpyjvbcenqorifa.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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
