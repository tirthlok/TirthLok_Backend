import { executeQuery, fetchAll, fetchOne } from '../config/database.js'
import config from '../config/index.js'
import { v4 as uuidv4 } from 'uuid'
import { executeQueryWithRetry } from '../utils/retry.js'

const { catalog, schema } = config.databricks

export const getAllBhojanshals = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { search } = req.query

    let query = `SELECT * FROM ${catalog}.${schema}.bhojanshalas WHERE 1=1`
    let countQuery = `SELECT COUNT(*) as total FROM ${catalog}.${schema}.bhojanshalas WHERE 1=1`
    const params = []

    if (search) {
      query += ` AND (name LIKE ? OR cuisine LIKE ?)`
      countQuery += ` AND (name LIKE ? OR cuisine LIKE ?)`
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [bhojanshalas, countResult] = await Promise.all([
      executeQueryWithRetry(fetchAll, query, params),
      executeQueryWithRetry(fetchOne, countQuery, params.slice(0, -2)),
    ])

    const total = countResult?.total || 0

    res.json({
      success: true,
      data: bhojanshalas,
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

export const getBhojanshalaById = async (req, res, next) => {
  try {
    const bhojanshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.bhojanshalas WHERE id = ?`,
      [req.params.id]
    )

    if (!bhojanshala) {
      return res.status(404).json({
        success: false,
        error: 'Bhojanshala not found',
      })
    }

    res.json({
      success: true,
      data: bhojanshala,
    })
  } catch (error) {
    next(error)
  }
}

export const createBhojanshala = async (req, res, next) => {
  try {
    const { name, cuisine, speciality, operatingHours, location } = req.body

    const id = uuidv4()
    const query = `INSERT INTO ${catalog}.${schema}.bhojanshalas 
      (id, name, cuisine, speciality, operating_hours, location, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())`

    const params = [
      id,
      name,
      cuisine,
      speciality,
      JSON.stringify(operatingHours),
      JSON.stringify(location),
    ]

    await executeQuery(query, params)

    const bhojanshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.bhojanshalas WHERE id = ?`,
      [id]
    )

    res.status(201).json({
      success: true,
      data: bhojanshala,
    })
  } catch (error) {
    next(error)
  }
}

export const updateBhojanshala = async (req, res, next) => {
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

    const query = `UPDATE ${catalog}.${schema}.bhojanshalas SET ${setClauses.join(
      ', '
    )}, updated_at = CURRENT_TIMESTAMP() WHERE id = ?`

    await executeQuery(query, params)

    const bhojanshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.bhojanshalas WHERE id = ?`,
      [id]
    )

    if (!bhojanshala) {
      return res.status(404).json({
        success: false,
        error: 'Bhojanshala not found',
      })
    }

    res.json({
      success: true,
      data: bhojanshala,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteBhojanshala = async (req, res, next) => {
  try {
    const { id } = req.params

    const bhojanshala = await fetchOne(
      `SELECT * FROM ${catalog}.${schema}.bhojanshalas WHERE id = ?`,
      [id]
    )

    if (!bhojanshala) {
      return res.status(404).json({
        success: false,
        error: 'Bhojanshala not found',
      })
    }

    await executeQuery(
      `DELETE FROM ${catalog}.${schema}.bhojanshalas WHERE id = ?`,
      [id]
    )

    res.json({
      success: true,
      message: 'Bhojanshala deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
