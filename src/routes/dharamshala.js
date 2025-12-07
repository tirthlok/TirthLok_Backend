import { executeQuery, fetchAll, fetchOne } from '../config/database.js'
import config from '../config/index.js'
import { v4 as uuidv4 } from 'uuid'
import { executeQueryWithRetry } from '../utils/retry.js'

const { catalog, schema } = config.databricks

export const getAllDharamshalas = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { search } = req.query

    let query = `SELECT * FROM ${catalog}.${schema}.dharamshalas WHERE 1=1`
    let countQuery = `SELECT COUNT(*) as total FROM ${catalog}.${schema}.dharamshalas WHERE 1=1`
    const params = []

    if (search) {
      query += ` AND (name LIKE ? OR location LIKE ?)`
      countQuery += ` AND (name LIKE ? OR location LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [dharamshalas, countResult] = await Promise.all([
      executeQueryWithRetry(fetchAll, query, params),
      executeQueryWithRetry(fetchOne, countQuery, params.slice(0, -2)),
    ])

    const total = countResult?.total || 0

    res.json({
      success: true,
      data: dharamshalas,
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

export const getDharamshalaById = async (req, res, next) => {
  try {
    const dharamshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.dharamshalas WHERE id = ?`,
      [req.params.id]
    )

    if (!dharamshala) {
      return res.status(404).json({
        success: false,
        error: 'Dharamshala not found',
      })
    }

    res.json({
      success: true,
      data: dharamshala,
    })
  } catch (error) {
    next(error)
  }
}

export const createDharamshala = async (req, res, next) => {
  try {
    const { name, location, facilities, rating, checkInTime, checkOutTime } = req.body

    const id = uuidv4()
    const query = `INSERT INTO ${catalog}.${schema}.dharamshalas 
      (id, name, location, facilities, rating, check_in_time, check_out_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`

    const params = [
      id,
      name,
      JSON.stringify(location),
      JSON.stringify(facilities || []),
      rating || 0,
      checkInTime,
      checkOutTime,
    ]

    await executeQuery(query, params)

    const dharamshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.dharamshalas WHERE id = ?`,
      [id]
    )

    res.status(201).json({
      success: true,
      data: dharamshala,
    })
  } catch (error) {
    next(error)
  }
}

export const updateDharamshala = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body

    const setClauses = []
    const params = []

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        setClauses.push(`${key} = ?`)
        params.push(
          typeof value === 'object' ? JSON.stringify(value) : value
        )
      }
    }

    params.push(id)

    const query = `UPDATE ${catalog}.${schema}.dharamshalas SET ${setClauses.join(
      ', '
    )}, updated_at = CURRENT_TIMESTAMP() WHERE id = ?`

    await executeQuery(query, params)

    const dharamshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.dharamshalas WHERE id = ?`,
      [id]
    )

    if (!dharamshala) {
      return res.status(404).json({
        success: false,
        error: 'Dharamshala not found',
      })
    }

    res.json({
      success: true,
      data: dharamshala,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteDharamshala = async (req, res, next) => {
  try {
    const { id } = req.params

    const dharamshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.dharamshalas WHERE id = ?`,
      [id]
    )

    if (!dharamshala) {
      return res.status(404).json({
        success: false,
        error: 'Dharamshala not found',
      })
    }

    await executeQuery(
      `DELETE FROM ${catalog}.${schema}.dharamshalas WHERE id = ?`,
      [id]
    )

    res.json({
      success: true,
      message: 'Dharamshala deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getDharamshalaRooms = async (req, res, next) => {
  try {
    const { id } = req.params

    const dharamshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.dharamshalas WHERE id = ?`,
      [id]
    )

    if (!dharamshala) {
      return res.status(404).json({
        success: false,
        error: 'Dharamshala not found',
      })
    }

    const rooms = await fetchAll(
      `SELECT * FROM ${catalog}.${schema}.rooms WHERE dharamshala_id = ?`,
      [id]
    )

    res.json({
      success: true,
      data: rooms,
    })
  } catch (error) {
    next(error)
  }
}
