import { executeQuery, fetchAll, fetchOne } from '../config/database.js'
import config from '../config/index.js'
import { v4 as uuidv4 } from 'uuid'
import { executeQueryWithRetry } from '../utils/retry.js'

const { catalog, schema } = config.databricks

export const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { status } = req.query

    let query = `SELECT * FROM ${catalog}.${schema}.bookings WHERE 1=1`
    let countQuery = `SELECT COUNT(*) as total FROM ${catalog}.${schema}.bookings WHERE 1=1`
    const params = []

    if (status) {
      query += ` AND status = ?`
      countQuery += ` AND status = ?`
      params.push(status)
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [bookings, countResult] = await Promise.all([
      executeQueryWithRetry(fetchAll, query, params),
      executeQueryWithRetry(fetchOne, countQuery, params.slice(0, -2)),
    ])

    const total = countResult?.total || 0

    res.json({
      success: true,
      data: bookings,
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

export const getUserBookings = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }

    const bookings = await executeQueryWithRetry(
      fetchAll,
      `SELECT b.*, d.name as dharamshala_name FROM ${catalog}.${schema}.bookings b
       LEFT JOIN ${catalog}.${schema}.dharamshalas d ON b.dharamshala_id = d.id
       WHERE b.user_id = ?
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    )

    const countResult = await executeQueryWithRetry(
      fetchOne,
      `SELECT COUNT(*) as total FROM ${catalog}.${schema}.bookings WHERE user_id = ?`,
      [req.user.id]
    )

    const total = countResult?.total || 0

    res.json({
      success: true,
      data: bookings || [],
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

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await executeQueryWithRetry(
      fetchOne,
      `SELECT b.*, d.name as dharamshala_name, u.email as user_email FROM ${catalog}.${schema}.bookings b
       LEFT JOIN ${catalog}.${schema}.dharamshalas d ON b.dharamshala_id = d.id
       LEFT JOIN ${catalog}.${schema}.users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [req.params.id]
    )

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    next(error)
  }
}

export const createBooking = async (req, res, next) => {
  try {
    const { dharamshalaId, roomId, checkInDate, checkOutDate } = req.body
    const userId = req.user.id

    const id = uuidv4()
    await executeQueryWithRetry(
      executeQuery,
      `INSERT INTO ${catalog}.${schema}.bookings 
       (id, user_id, dharamshala_id, room_id, check_in_date, check_out_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', CURRENT_TIMESTAMP())`,
      [id, userId, dharamshalaId, roomId, checkInDate, checkOutDate]
    )

    const booking = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.bookings WHERE id = ?`,
      [id]
    )

    res.status(201).json({
      success: true,
      data: booking,
    })
  } catch (error) {
    next(error)
  }
}

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body

    const setClauses = []
    const params = []

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'user_id') {
        setClauses.push(`${key} = ?`)
        params.push(
          typeof value === 'object' ? JSON.stringify(value) : value
        )
      }
    }

    params.push(id)

    const query = `UPDATE ${catalog}.${schema}.bookings SET ${setClauses.join(
      ', '
    )}, updated_at = CURRENT_TIMESTAMP() WHERE id = ?`

    await executeQueryWithRetry(executeQuery, query, params)

    const booking = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.bookings WHERE id = ?`,
      [id]
    )

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params

    await executeQueryWithRetry(
      executeQuery,
      `UPDATE ${catalog}.${schema}.bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP() WHERE id = ?`,
      [id]
    )

    const booking = await executeQueryWithRetry(
      fetchOne,
      `SELECT * FROM ${catalog}.${schema}.bookings WHERE id = ?`,
      [id]
    )

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      })
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    next(error)
  }
}
