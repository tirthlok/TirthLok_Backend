import { executeQuery, fetchAll, fetchOne } from '../config/database.js'
import config from '../config/index.js'
import { v4 as uuidv4 } from 'uuid'
import { executeQueryWithRetry } from '../utils/retry.js'

const { catalog, schema } = config.databricks

export const getAllTirths = async (req, res, next) => {
  try {
    // Use pagination from middleware validation
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { search, sect, type, includeDetails } = req.query

    let query = `SELECT * FROM ${catalog}.${schema}.tirth WHERE 1=1`
    let countQuery = `SELECT COUNT(*) as total FROM ${catalog}.${schema}.tirth WHERE 1=1`
    const params = []

    if (search) {
      query += ` AND (tirth_name LIKE ? OR location LIKE ?)`
      countQuery += ` AND (tirth_name LIKE ? OR location LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }

    if (sect) {
      query += ` AND sect = ?`
      countQuery += ` AND sect = ?`
      params.push(sect)
    }

    if (type) {
      query += ` AND type = ?`
      countQuery += ` AND type = ?`
      params.push(type)
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    // Execute with retry logic
    const [tirth, countResult] = await Promise.all([
      executeQueryWithRetry(fetchAll, query, params),
      executeQueryWithRetry(fetchOne, countQuery, params.slice(0, -2)),
    ])

    const total = countResult?.total || 0

    // Fetch details for all tirths if requested
    let tirthsWithDetails = tirth
    if (includeDetails === 'true' && tirth.length > 0) {
      tirthsWithDetails = await Promise.all(
        tirth.map(async (t) => {
          const details = await executeQueryWithRetry(
            fetchAll,
            `SELECT * FROM ${catalog}.${schema}.tirth_detail WHERE tirth_name = ?`,
            [t.tirth_name]
          )
          return { ...t, details: details || [] }
        })
      )
    }

    res.json({
      success: true,
      data: tirthsWithDetails,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getTirthById = async (req, res, next) => {
  try {
    const { includeDetails } = req.query
    
    const tirth = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.tirth WHERE tirth_name = ?`,
      [req.params.id]
    )

    if (!tirth) {
      return res.status(404).json({
        success: false,
        error: 'Tirth not found',
      })
    }

    // Fetch tirth details if requested
    let details = null
    if (includeDetails === 'true') {
      details = await executeQueryWithRetry(
        fetchAll,
        `SELECT * FROM ${catalog}.${schema}.tirth_detail WHERE tirth_name = ?`,
        [req.params.id]
      )
    }

    const responseData = includeDetails === 'true' 
      ? { ...tirth, details: details || [] }
      : tirth

    res.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    next(error)
  }
}

export const createTirth = async (req, res, next) => {
  try {
    const {
      tirth_name,
      location,
      sect,
      type,
      description,
      rating,
      timings,
      festivals,
      facilities,
    } = req.body

    const query = `INSERT INTO ${catalog}.${schema}.tirth 
      (tirth_name, location, sect, type, description, rating, timings, festivals, facilities, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`

    const params = [
      tirth_name,
      JSON.stringify(location),
      sect,
      type,
      description,
      rating || 0,
      JSON.stringify(timings || []),
      JSON.stringify(festivals || []),
      JSON.stringify(facilities || []),
    ]

    await executeQueryWithRetry(executeQuery, query, params)

    const tirth = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.tirth WHERE tirth_name = ?`,
      [tirth_name]
    )

    res.status(201).json({
      success: true,
      data: tirth,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTirth = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Build dynamic UPDATE query
    const setClauses = []
    const params = []

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'tirth_name' && key !== 'created_at') {
        setClauses.push(`${key} = ?`)
        params.push(
          typeof value === 'object' ? JSON.stringify(value) : value
        )
      }
    }

    params.push(id)

    const query = `UPDATE ${catalog}.${schema}.tirth SET ${setClauses.join(
      ', '
    )}, updated_at = CURRENT_TIMESTAMP() WHERE tirth_name = ?`

    await executeQueryWithRetry(executeQuery, query, params)

    const tirth = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.tirth WHERE tirth_name = ?`,
      [id]
    )

    if (!tirth) {
      return res.status(404).json({
        success: false,
        error: 'Tirth not found',
      })
    }

    res.json({
      success: true,
      data: tirth,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteTirth = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if exists
    const tirth = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.tirth WHERE tirth_name = ?`,
      [id]
    )

    if (!tirth) {
      return res.status(404).json({
        success: false,
        error: 'Tirth not found',
      })
    }

    await executeQueryWithRetry(
      executeQuery,
      `DELETE FROM ${catalog}.${schema}.tirth WHERE tirth_name = ?`,
      [id]
    )

    res.json({
      success: true,
      message: 'Tirth deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
