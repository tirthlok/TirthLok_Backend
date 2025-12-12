import { initSupabaseAdmin } from '../config/supabase.js'

const inspectTableData = async () => {
  try {
    const supabase = initSupabaseAdmin()

    // Fetch all data from tirth_festivals_and_events table
    const { data, error } = await supabase
      .from('tirth_festivals_and_events')
      .select('*')

    if (error) {
      console.error('❌ Error fetching data:', error)
      return
    }

    console.log('\n📊 Table: tirth_festivals_and_events')
    console.log('================================')
    
    if (!data || data.length === 0) {
      console.log('❌ No data found in table')
      return
    }

    console.log(`✅ Found ${data.length} records\n`)
    
    // Display column names
    if (data.length > 0) {
      const columns = Object.keys(data[0])
      console.log('📋 Columns:', columns)
      console.log('  - event_id')
      console.log('  - tirth_name')
      console.log('  - created_dt')
      console.log('  - tithi (lunar calendar date)')
      console.log('  - time_frame (gregorian calendar date range)')
      console.log('  - event_description')
      console.log('  - event_details')
      console.log('')
    }

    // Display all data
    console.log('📋 Data:')
    console.log(JSON.stringify(data, null, 2))

    // Also check tirth_cards table
    const { data: tirthData, error: tirthError } = await supabase
      .from('tirth_cards')
      .select('tirth_name')
      .limit(10)

    console.log('\n📊 Available Tirths:')
    console.log('================================')
    if (tirthError) {
      console.error('Error:', tirthError)
    } else {
      console.log(tirthData.map(t => t.tirth_name))
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

inspectTableData()
