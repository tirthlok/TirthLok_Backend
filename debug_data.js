import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function debugData() {
  console.log('\n=== Debugging Data Retrieval ===\n')

  // Get all columns first
  console.log('Step 1: Getting column information...')
  try {
    const { data, error } = await client.rpc('get_table_columns', {
      schema_name: 'tirthlok',
      table_name: 'tirth_cards'
    })
    if (!error && data) {
      console.log('Columns:', data)
    }
  } catch (e) {
    console.log('RPC not available, skipping column check')
  }

  // Try basic query without schema
  console.log('\nStep 2: Query with schema=tirthlok, select=*')
  try {
    const { data, error, count, status } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('*', { count: 'exact' })

    console.log('Status:', status)
    console.log('Count:', count)
    console.log('Error:', error)
    console.log('Data length:', data?.length)
    if (data && data.length > 0) {
      console.log('✅ Found', data.length, 'records')
      console.log('First record:', JSON.stringify(data[0]))
    } else {
      console.log('❌ No data found')
    }
  } catch (err) {
    console.log('Exception:', err.message, err)
  }

  // Try with specific limit
  console.log('\nStep 3: Query with limit(100)')
  try {
    const { data, error } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('*')
      .limit(100)

    console.log('Error:', error)
    console.log('Data:', data?.length ? `${data.length} records` : 'empty')
    if (data && data.length > 0) {
      console.log('First record keys:', Object.keys(data[0]))
    }
  } catch (err) {
    console.log('Exception:', err.message)
  }

  // Check if it's a permission issue
  console.log('\nStep 4: Checking row count differently')
  try {
    const { data, error, status } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('*', { count: 'exact', head: true })

    console.log('Status:', status)
    console.log('Count:', data)
    console.log('Error:', error)
  } catch (err) {
    console.log('Exception:', err.message)
  }

  process.exit(0)
}

debugData()
