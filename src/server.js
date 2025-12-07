import config from './config/index.js'
import { connectDB } from './config/database.js'
import { createApp } from './app.js'

const startServer = async () => {
  try {
    // Connect to database
    await connectDB()

    // Create Express app
    const app = createApp()

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${config.port}`)
      console.log(`📝 API Documentation: http://localhost:${config.port}/api/v1`)
      console.log(`🔍 Health Check: http://localhost:${config.port}/health`)
      console.log(`📊 Node Environment: ${config.nodeEnv}\n`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server')
      server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server')
      server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('❌ Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
