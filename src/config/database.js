import * as supabase from './supabase.js'
import config from './index.js'

export const connectDB = async () => {
  try {
    await supabase.connectSupabase()
    console.log(`✓ Supabase Database Connected`)
    return true
  } catch (error) {
    console.error(`✗ Database connection failed: ${error.message}`)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  await supabase.disconnectSupabase()
}

export const fetchAll = async (table, filters = {}, options = {}, useAdmin = false) => {
  return supabase.fetchAll(table, filters, options, useAdmin)
}

export const fetchOne = async (table, filters = {}, options = {}) => {
  return supabase.fetchOne(table, filters, options)
}

export const insertOne = async (table, data) => {
  return supabase.insertOne(table, data)
}

export const insertMany = async (table, dataArray) => {
  return supabase.insertMany(table, dataArray)
}

export const updateOne = async (table, filters = {}, updateData = {}) => {
  return supabase.updateOne(table, filters, updateData)
}

export const updateMany = async (table, filters = {}, updateData = {}) => {
  return supabase.updateMany(table, filters, updateData)
}

export const deleteOne = async (table, filters = {}) => {
  return supabase.deleteOne(table, filters)
}

export const countDocuments = async (table, filters = {}) => {
  return supabase.countDocuments(table, filters)
}

export const executeRawQuery = async (sql) => {
  return supabase.executeRawQuery(sql)
}

