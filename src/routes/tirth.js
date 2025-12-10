import { fetchAll, fetchOne, insertOne, updateOne, deleteOne, countDocuments } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export const getAllTirths = async (req, res, next) => {
  try {
    // Use pagination from middleware validation
    const { page, limit, offset } = req.pagination || { page: 1, limit: 10, offset: 0 }
    const { search, sect, type, includeDetails } = req.query

    let filters = {}
    let searchQuery = null

    if (search) {
      searchQuery = search
    }

    if (sect) {
      filters.sect = sect
    }

    if (type) {
      filters.type = type
    }

    // TODO: Implement full-text search for LIKE queries in Supabase
    // For now, fetch data and filter in-memory if search is provided
    const options = {
      limit,
      offset,
      orderBy: 'tirth_name',
      ascending: true,
      select: '*'
    }

    const { data: tirth, count: total } = await fetchAll('tirth_cards', filters, options)

    // Fetch details for all tirths by default
    let tirthsWithDetails = tirth
    if (tirth.length > 0) {
      tirthsWithDetails = await Promise.all(
        tirth.map(async (t) => {
          const { data: details } = await fetchAll('tirth_details', { tirth_name: t.tirth_name }, {}, true)
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
    
    const tirth = await fetchOne('tirth_cards', { tirth_name: req.params.id })

    if (!tirth) {
      return res.status(404).json({
        success: false,
        error: 'Tirth not found',
      })
    }

    // Fetch tirth details using admin client
    let details = []
    try {
      const { data } = await fetchAll('tirth_details', { tirth_name: req.params.id }, {}, true)
      details = data || []
    } catch (error) {
      console.error(`Error fetching tirth_details: ${error.message}`)
      details = []
    }

    const responseData = { ...tirth, details }

    res.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get Tirth Details
 */
export const getTirthDetails = async (req, res, next) => {
  try {
    const { tirth_name } = req.query
    
    if (!tirth_name) {
      return res.status(400).json({
        success: false,
        error: 'tirth_name parameter is required',
      })
    }

    // Use admin client (useAdmin = true) to bypass RLS
    const { data: details } = await fetchAll('tirth_details', { tirth_name }, {}, true)
    
    res.json({
      success: true,
      data: details || [],
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

    const newTirth = await insertOne('tirth_cards', {
      tirth_name,
      location: location,
      sect,
      type,
      description,
      rating: rating || 0,
      timings: timings || [],
      festivals: festivals || [],
      facilities: facilities || [],
      created_at: new Date(),
    })

    const tirth = await fetchOne('tirth_cards', { tirth_name })

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

    // Prepare update object (exclude tirth_name and created_at)
    const updateData = {}
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'tirth_name' && key !== 'created_at') {
        updateData[key] = value
      }
    }
    updateData.updated_at = new Date()

    await updateOne('tirth_cards', { tirth_name: id }, updateData)

    const tirth = await fetchOne('tirth_cards', { tirth_name: id })

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
    const tirth = await fetchOne('tirth_cards', { tirth_name: id })

    if (!tirth) {
      return res.status(404).json({
        success: false,
        error: 'Tirth not found',
      })
    }

    await deleteOne('tirth_cards', { tirth_name: id })

    res.json({
      success: true,
      message: 'Tirth deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
