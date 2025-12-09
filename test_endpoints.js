import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/v1'

const endpoints = [
  { method: 'GET', path: '/tirth', name: 'Get All Tirths' },
  { method: 'GET', path: '/tirth?page=1&limit=5', name: 'Get Tirths with pagination' },
  { method: 'GET', path: '/dharamshala', name: 'Get All Dharamshala' },
  { method: 'GET', path: '/bhojanshala', name: 'Get All Bhojanshala' },
  { method: 'GET', path: '/booking', name: 'Get All Bookings' },
  { method: 'GET', path: '/health', name: 'Health Check' },
]

async function testEndpoints() {
  console.log('\n=== Testing All API Endpoints ===\n')

  for (const endpoint of endpoints) {
    try {
      const url = BASE_URL + endpoint.path
      const response = await axios({
        method: endpoint.method,
        url: url,
        timeout: 5000
      })

      const dataLength = response.data?.data?.length || 0
      const status = response.status
      const total = response.data?.pagination?.total || 'N/A'

      console.log(`✅ ${endpoint.name}`)
      console.log(`   URL: ${endpoint.method} ${endpoint.path}`)
      console.log(`   Status: ${status}`)
      console.log(`   Records: ${dataLength} (Total: ${total})`)
      console.log(`   Response keys: ${Object.keys(response.data).join(', ')}`)
      console.log()
    } catch (error) {
      console.log(`❌ ${endpoint.name}`)
      console.log(`   URL: ${endpoint.method} ${endpoint.path}`)
      console.log(`   Error: ${error.message}`)
      if (error.response) {
        console.log(`   Status: ${error.response.status}`)
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`)
      }
      console.log()
    }
  }

  process.exit(0)
}

// Wait a bit for server to be ready
setTimeout(testEndpoints, 1000)
