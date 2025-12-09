import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testSchema() {
  console.log('\n=== Testing Supabase Schema Access ===\n')

  // Test 1: Try with .schema() method
  console.log('Test 1: Using .schema("tirthlok")')
  try {
    const { data: data1, error: error1, count: count1 } = await client
      .schema('tirthlok')
      .from('tirth_cards')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('✅ Result:', { count: count1, dataLength: data1?.length, hasError: !!error1 })
    if (error1) console.log('   Error:', error1)
    if (data1?.length) console.log('   First row:', JSON.stringify(data1[0]).substring(0, 200))
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // Test 2: Try without schema (public)
  console.log('\nTest 2: Without schema (public)')
  try {
    const { data: data2, error: error2, count: count2 } = await client
      .from('tirth_cards')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('✅ Result:', { count: count2, dataLength: data2?.length, hasError: !!error2 })
    if (error2) console.log('   Error:', error2)
    if (data2?.length) console.log('   First row:', JSON.stringify(data2[0]).substring(0, 200))
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // Test 3: Try tirthlok.tirth_cards qualified name
  console.log('\nTest 3: Using qualified table name "tirthlok.tirth_cards"')
  try {
    const { data: data3, error: error3, count: count3 } = await client
      .from('tirthlok.tirth_cards')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('✅ Result:', { count: count3, dataLength: data3?.length, hasError: !!error3 })
    if (error3) console.log('   Error:', error3)
    if (data3?.length) console.log('   First row:', JSON.stringify(data3[0]).substring(0, 200))
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // Test 4: Raw RPC to check table existence
  console.log('\nTest 4: Checking if table exists via query')
  try {
    const { data: data4, error: error4 } = await client.rpc('exec_sql', { 
      sql: 'SELECT COUNT(*) as cnt FROM tirthlok.tirth_cards;'
    }).catch(err => ({ error: err }))

    if (error4) {
      console.log('❌ RPC Error:', error4.message || error4)
    } else {
      console.log('✅ Table exists, result:', data4)
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  process.exit(0)
}

testSchema()
