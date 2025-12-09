import { fetchAll, fetchOne, insertOne, updateOne, deleteOne } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export const getAllBhojanshals = async (req, res, next) => {
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

    const { data: bhojanshalas, count: total } = await fetchAll('bhojanshalas', filters, options)

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
    const bhojanshala = await fetchOne('bhojanshalas', { id: req.params.id })

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
    const newBhojanshala = await insertOne('bhojanshalas', {
      id,
      name,
      cuisine,
      speciality,
      operating_hours: operatingHours,
      location: location,
      created_at: new Date(),
    })

    const bhojanshala = await fetchOne('bhojanshalas', { id })

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

    const updateData = {}
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        updateData[key] = value
      }
    }
    updateData.updated_at = new Date()

    await updateOne('bhojanshalas', { id }, updateData)

    const bhojanshala = await fetchOne('bhojanshalas', { id })

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

    const bhojanshala = await fetchOne('bhojanshalas', { id })

    if (!bhojanshala) {
      return res.status(404).json({
        success: false,
        error: 'Bhojanshala not found',
      })
    }

    await deleteOne('bhojanshalas', { id })

    res.json({
      success: true,
      message: 'Bhojanshala deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
