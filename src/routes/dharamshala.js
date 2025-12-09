import { fetchAll, fetchOne, insertOne, updateOne, deleteOne } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export const getAllDharamshalas = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { search } = req.query

    const filters = {}
    const options = {
      limit,
      offset,
      orderBy: 'name',
      ascending: true,
    }

    const { data: dharamshalas, count: total } = await fetchAll('dharamshalas', filters, options)

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
    const dharamshala = await fetchOne('dharamshalas', { id: req.params.id })

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
    const newDharamshala = await insertOne('dharamshalas', {
      id,
      name,
      location: location,
      facilities: facilities || [],
      rating: rating || 0,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      created_at: new Date(),
    })

    const dharamshala = await fetchOne('dharamshalas', { id })

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

    const updateData = {}
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        updateData[key] = value
      }
    }
    updateData.updated_at = new Date()

    await updateOne('dharamshalas', { id }, updateData)

    const dharamshala = await fetchOne('dharamshalas', { id })

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

    const dharamshala = await fetchOne('dharamshalas', { id })

    if (!dharamshala) {
      return res.status(404).json({
        success: false,
        error: 'Dharamshala not found',
      })
    }

    await deleteOne('dharamshalas', { id })

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

    const dharamshala = await fetchOne('dharamshalas', { id })

    if (!dharamshala) {
      return res.status(404).json({
        success: false,
        error: 'Dharamshala not found',
      })
    }

    const { data: rooms } = await fetchAll('rooms', { dharamshala_id: id })

    res.json({
      success: true,
      data: rooms,
    })
  } catch (error) {
    next(error)
  }
}
