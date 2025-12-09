import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function inspectTable() {
  console.log('\n=== Inspecting tirth_cards Table ===\n')

  // Test with minimal select
  console.log('Test 1: Select id only')
  try {
    const { data, error, count } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('id', { count: 'exact' })
      .limit(1)

    console.log('Count:', count)
    console.log('Error:', error)
    console.log('Data:', data)
  } catch (err) {
    console.log('Exception:', err.message)
  }

  // Test with select *
  console.log('\nTest 2: Select * with head=true (just to get columns)')
  try {
    const { data, error, count } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('*', { count: 'exact', head: true })

    console.log('Count:', count)
    console.log('Error:', error)
    console.log('Data:', data)
  } catch (err) {
    console.log('Exception:', err.message)
  }

  // Test direct fetch without ordering or limit first
  console.log('\nTest 3: Simple select all')
  try {
    const { data, error, count } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('*', { count: 'exact' })

    console.log('Count:', count)
    console.log('Data length:', data?.length)
    console.log('Error:', error)
    if (data && data.length > 0) {
      console.log('First record keys:', Object.keys(data[0]))
      console.log('First record:', JSON.stringify(data[0]).substring(0, 300))
    } else {
      console.log('No data returned')
    }
  } catch (err) {
    console.log('Exception:', err.message)
  }

  process.exit(0)
}

inspectTable()
