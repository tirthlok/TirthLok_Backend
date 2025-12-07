/**
 * Input validation middleware for common entity operations
 */

import { validationError, validatePagination, validators } from './validation.js'

/**
 * Middleware to validate pagination parameters
 */
export const validatePaginationMiddleware = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query
  
  const { isValid, page: validPage, limit: validLimit, errors } = validatePagination(
    page,
    limit
  )
  
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid pagination parameters',
      details: errors,
    })
  }
  
  // Attach validated pagination to request
  req.pagination = {
    page: validPage,
    limit: validLimit,
    offset: (validPage - 1) * validLimit,
  }
  
  next()
}

/**
 * Validate Tirth creation/update request
 */
export const validateTirthInput = (req, res, next) => {
  const { name, location, sect, type, description, rating } = req.body
  const errors = []
  
  // Required fields
  if (!validators.isValidString(name, 1, 200)) {
    errors.push('Name must be a string between 1-200 characters')
  }
  
  if (!validators.isValidString(location, 1, 300)) {
    errors.push('Location must be a string between 1-300 characters')
  }
  
  // Optional fields with validation
  if (sect && !['Shwetambar', 'Digambar'].includes(sect)) {
    errors.push('Sect must be either "Shwetambar" or "Digambar"')
  }
  
  if (type && !['Gyan-sthan', 'Siddhakshetra', 'Atishay-Kshetra'].includes(type)) {
    errors.push('Type must be one of: Gyan-sthan, Siddhakshetra, Atishay-Kshetra')
  }
  
  if (description && !validators.isValidString(description, 1, 2000)) {
    errors.push('Description must be a string between 1-2000 characters')
  }
  
  if (rating !== undefined) {
    if (!validators.isValidNonNegativeNumber(rating) || rating > 5) {
      errors.push('Rating must be a number between 0-5')
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    })
  }
  
  next()
}

/**
 * Validate Dharamshala creation/update request
 */
export const validateDharamshalaInput = (req, res, next) => {
  const { name, location, phone, email, capacity, pricePerRoom } = req.body
  const errors = []
  
  if (!validators.isValidString(name, 1, 200)) {
    errors.push('Name must be a string between 1-200 characters')
  }
  
  if (!validators.isValidString(location, 1, 300)) {
    errors.push('Location must be a string between 1-300 characters')
  }
  
  if (phone && !validators.isValidPhone(phone)) {
    errors.push('Invalid phone number format')
  }
  
  if (email && !validators.isValidEmail(email)) {
    errors.push('Invalid email format')
  }
  
  if (capacity !== undefined) {
    if (!validators.isValidPositiveNumber(capacity)) {
      errors.push('Capacity must be a positive number')
    }
  }
  
  if (pricePerRoom !== undefined) {
    if (!validators.isValidNonNegativeNumber(pricePerRoom)) {
      errors.push('Price per room must be a non-negative number')
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    })
  }
  
  next()
}

/**
 * Validate Bhojanshala creation/update request
 */
export const validateBhojanshalaInput = (req, res, next) => {
  const { name, location, phone, cuisineType } = req.body
  const errors = []
  
  if (!validators.isValidString(name, 1, 200)) {
    errors.push('Name must be a string between 1-200 characters')
  }
  
  if (!validators.isValidString(location, 1, 300)) {
    errors.push('Location must be a string between 1-300 characters')
  }
  
  if (phone && !validators.isValidPhone(phone)) {
    errors.push('Invalid phone number format')
  }
  
  if (cuisineType && !['Vegetarian', 'Vegan', 'Mixed'].includes(cuisineType)) {
    errors.push('Cuisine type must be one of: Vegetarian, Vegan, Mixed')
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    })
  }
  
  next()
}

/**
 * Validate user authentication input
 */
export const validateAuthInput = (req, res, next) => {
  const { email, password, name } = req.body
  const errors = []
  
  if (!validators.isValidEmail(email)) {
    errors.push('Invalid email format')
  }
  
  if (!validators.isValidString(password, 8, 128)) {
    errors.push('Password must be between 8-128 characters')
  }
  
  // For registration, name is required
  if (req.path.includes('register')) {
    if (!validators.isValidString(name, 1, 100)) {
      errors.push('Name must be a string between 1-100 characters')
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    })
  }
  
  next()
}

/**
 * Validate booking input
 */
export const validateBookingInput = (req, res, next) => {
  const { dharamshalaId, roomId, checkInDate, checkOutDate, guestName, guestPhone, guestEmail } = req.body
  const errors = []
  
  if (!validators.isValidString(dharamshalaId, 1, 100)) {
    errors.push('Invalid dharamshala ID')
  }
  
  if (!validators.isValidString(roomId, 1, 100)) {
    errors.push('Invalid room ID')
  }
  
  if (!validators.isValidDate(checkInDate)) {
    errors.push('Check-in date must be a valid date')
  }
  
  if (!validators.isValidDate(checkOutDate)) {
    errors.push('Check-out date must be a valid date')
  }
  
  if (new Date(checkInDate) >= new Date(checkOutDate)) {
    errors.push('Check-out date must be after check-in date')
  }
  
  if (!validators.isValidString(guestName, 1, 100)) {
    errors.push('Guest name must be a string between 1-100 characters')
  }
  
  if (!validators.isValidPhone(guestPhone)) {
    errors.push('Invalid phone number format')
  }
  
  if (!validators.isValidEmail(guestEmail)) {
    errors.push('Invalid email format')
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    })
  }
  
  next()
}

/**
 * Sanitize user search input to prevent SQL injection
 */
export const sanitizeSearchInput = (req, res, next) => {
  if (req.query.search) {
    // Remove potentially dangerous characters, allow only alphanumeric, spaces, and some punctuation
    req.query.search = req.query.search
      .replace(/[^a-zA-Z0-9\s\-\.,']/g, '')
      .trim()
      .substring(0, 100) // Limit search length
  }
  
  next()
}
