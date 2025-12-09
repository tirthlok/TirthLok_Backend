import { createClient } from '@supabase/supabase-js'
import config from './index.js'

let supabaseClient = null

/**
 * Initialize Supabase client
 */
export const initSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      config.supabase.url,
      config.supabase.anonKey
    )
  }
  return supabaseClient
}

/**
 * Get Supabase client instance
 */
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initSupabase() first.')
  }
  return supabaseClient
}

/**
 * Connect to Supabase (validate connection)
 */
export const connectSupabase = async () => {
  try {
    console.log('🔗 Connecting to Supabase...')
    
    const client = initSupabase()
    
    // Validate connection by making a simple query
    const { error } = await client
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Supabase Connected')
    console.log(`   Project: ${config.supabase.url}`)
    
    return client
  } catch (error) {
    console.error(`❌ Supabase connection failed: ${error.message}`)
    throw error
  }
}

/**
 * Disconnect from Supabase
 */
export const disconnectSupabase = async () => {
  try {
    if (supabaseClient) {
      // Supabase doesn't require explicit disconnect, but we can clean up
      supabaseClient = null
      console.log('✓ Supabase disconnected')
    }
  } catch (error) {
    console.error(`✗ Supabase disconnection failed: ${error.message}`)
  }
}

/**
 * Execute raw SQL query
 */
export const executeRawQuery = async (sql) => {
  try {
    const client = getSupabaseClient()
    
    const { data, error } = await client.rpc('exec_query', {
      query: sql
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Raw query error:', error.message)
    throw error
  }
}

/**
 * Execute a SELECT query
 */
export const fetchAll = async (table, filters = {}, options = {}) => {
  try {
    const client = getSupabaseClient()
    const { limit = null, offset = 0, orderBy = null, ascending = true, select = '*' } = options

    console.log(`📊 Fetching from schema: tirthlok, table: ${table}`)
    console.log(`🔍 Filters:`, JSON.stringify(filters))
    console.log(`⚙️ Options:`, JSON.stringify(options))

    let query = client
      .schema('tirthlok')
      .from(table)
      .select(select, { count: 'exact' })

    console.log(`🔗 Query built for table: ${table}`)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        console.log(`  ➕ Adding filter: ${key} = ${value}`)
        query = query.eq(key, value)
      }
    })

    // Apply ordering
    if (orderBy) {
      console.log(`  📈 Ordering by: ${orderBy} (${ascending ? 'ASC' : 'DESC'})`)
      query = query.order(orderBy, { ascending })
    }

    // Apply pagination
    if (limit) {
      console.log(`  📄 Pagination: limit=${limit}, offset=${offset}`)
      query = query.range(offset, offset + limit - 1)
    }

    console.log(`⏳ Executing query...`)
    const { data, error, count } = await query

    if (error) {
      console.error(`❌ Query error:`, JSON.stringify(error))
      throw error
    }

    console.log(`✅ Query result - Count: ${count}, Data length: ${data?.length || 0}, Data:`, JSON.stringify(data).substring(0, 500))

    return { data: data || [], count }
  } catch (error) {
    console.error('❌ Fetch all error:', error.message, error)
    throw error
  }
}

/**
 * Execute a SELECT query for a single record
 */
export const fetchOne = async (table, filters = {}, options = {}) => {
  try {
    const client = getSupabaseClient()
    const { select = '*' } = options

    let query = client
      .schema('tirthlok')
      .from(table)
      .select(select)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query.single()

    if (error && error.code === 'PGRST116') {
      // No rows found - return null instead of throwing
      return null
    }

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Fetch one error:', error.message)
    throw error
  }
}

/**
 * Insert a record
 */
export const insertOne = async (table, data) => {
  try {
    const client = getSupabaseClient()
    
    const { data: result, error } = await client
      .schema('tirthlok')
      .from(table)
      .insert([data])
      .select()

    if (error) {
      throw error
    }

    return result?.[0] || null
  } catch (error) {
    console.error('Insert one error:', error.message)
    throw error
  }
}

/**
 * Insert multiple records
 */
export const insertMany = async (table, dataArray) => {
  try {
    const client = getSupabaseClient()
    
    const { data: result, error } = await client
      .schema('tirthlok')
      .from(table)
      .insert(dataArray)
      .select()

    if (error) {
      throw error
    }

    return result || []
  } catch (error) {
    console.error('Insert many error:', error.message)
    throw error
  }
}

/**
 * Update a record
 */
export const updateOne = async (table, filters = {}, updateData = {}) => {
  try {
    const client = getSupabaseClient()
    
    let query = client
      .schema('tirthlok')
      .from(table)
      .update(updateData)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data: result, error } = await query.select()

    if (error) {
      throw error
    }

    return result?.[0] || null
  } catch (error) {
    console.error('Update one error:', error.message)
    throw error
  }
}

/**
 * Update multiple records
 */
export const updateMany = async (table, filters = {}, updateData = {}) => {
  try {
    const client = getSupabaseClient()
    
    let query = client
      .schema('tirthlok')
      .from(table)
      .update(updateData)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data: result, error } = await query.select()

    if (error) {
      throw error
    }

    return result || []
  } catch (error) {
    console.error('Update many error:', error.message)
    throw error
  }
}

/**
 * Delete a record
 */
export const deleteOne = async (table, filters = {}) => {
  try {
    const client = getSupabaseClient()
    
    let query = client
      .schema('tirthlok')
      .from(table)
      .delete()

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { error } = await query

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Delete one error:', error.message)
    throw error
  }
}

/**
 * Count records
 */
export const countDocuments = async (table, filters = {}) => {
  try {
    const client = getSupabaseClient()
    
    let query = client
      .schema('tirthlok')
      .from(table)
      .select('id', { count: 'exact', head: true })

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { count, error } = await query

    if (error) {
      throw error
    }

    return count || 0
  } catch (error) {
    console.error('Count documents error:', error.message)
    throw error
  }
}
