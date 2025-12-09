import { fetchAll, fetchOne, insertOne, updateOne } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export const getAllBookings = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { status } = req.query

    const filters = {}
    if (status) {
      filters.status = status
    }

    const options = {
      limit,
      offset,
      orderBy: 'created_at',
      ascending: false,
    }

    const { data: bookings, count: total } = await fetchAll('bookings', filters, options)

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

    const options = {
      limit,
      offset,
      select: 'id, user_id, dharamshala_id, room_id, check_in_date, check_out_date, status, created_at, updated_at',
    }

    const { data: bookings, count: total } = await fetchAll(
      'bookings',
      { user_id: req.user.id },
      options
    )

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
    const booking = await fetchOne('bookings', { id: req.params.id })

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
    const newBooking = await insertOne('bookings', {
      id,
      user_id: userId,
      dharamshala_id: dharamshalaId,
      room_id: roomId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      status: 'confirmed',
      created_at: new Date(),
    })

    const booking = await fetchOne('bookings', { id })

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

    const updateData = {}
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'user_id') {
        updateData[key] = value
      }
    }
    updateData.updated_at = new Date()

    await updateOne('bookings', { id }, updateData)

    const booking = await fetchOne('bookings', { id })

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

    await updateOne('bookings', { id }, { status: 'cancelled', updated_at: new Date() })

    const booking = await fetchOne('bookings', { id })

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
