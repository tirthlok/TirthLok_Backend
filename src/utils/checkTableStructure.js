import { initSupabaseAdmin } from '../config/supabase.js'

const checkTableStructure = async () => {
  try {
    const supabase = initSupabaseAdmin()

    // Fetch data and check actual columns
    const { data, error } = await supabase
      .from('tirth_festivals_and_events')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error)
      return
    }

    if (data && data.length > 0) {
      const actualColumns = Object.keys(data[0])
      console.log('\n✅ ACTUAL COLUMNS IN TABLE:')
      console.log('================================')
      actualColumns.forEach((col, index) => {
        console.log(`${index + 1}. ${col}`)
      })
      
      console.log('\n📊 SAMPLE DATA:')
      console.log(JSON.stringify(data[0], null, 2))
    } else {
      console.log('No data found')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkTableStructure()
