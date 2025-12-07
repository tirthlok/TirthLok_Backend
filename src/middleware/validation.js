/**
 * Input validation utilities for common field types and patterns
 */

export const validators = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPhone: (phone) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    return phoneRegex.test(phone)
  },

  isValidUrl: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  isValidDate: (dateStr) => {
    const date = new Date(dateStr)
    return date instanceof Date && !isNaN(date)
  },

  isValidCoordinate: (lat, lng) => {
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
  },

  isValidPositiveNumber: (num) => {
    const n = parseFloat(num)
    return !isNaN(n) && n > 0
  },

  isValidNonNegativeNumber: (num) => {
    const n = parseFloat(num)
    return !isNaN(n) && n >= 0
  },

  isValidString: (str, minLength = 1, maxLength = 1000) => {
    if (typeof str !== 'string') return false
    return str.length >= minLength && str.length <= maxLength
  },

  isValidArray: (arr) => {
    return Array.isArray(arr)
  },

  isValidBoolean: (val) => {
    return typeof val === 'boolean'
  },

  isValidCurrency: (amount) => {
    const num = parseFloat(amount)
    return !isNaN(num) && num >= 0 && num <= 999999999
  },
}

/**
 * Validation error response creator
 */
export const validationError = (field, message) => ({
  success: false,
  error: message,
  field,
})

/**
 * Validate pagination parameters
 */
export const validatePagination = (page, limit) => {
  const errors = []
  
  const pageNum = parseInt(page, 10) || 1
  const limitNum = parseInt(limit, 10) || 10

  if (pageNum < 1) {
    errors.push('Page must be greater than or equal to 1')
  }

  if (limitNum < 1) {
    errors.push('Limit must be greater than or equal to 1')
  }

  if (limitNum > 100) {
    errors.push('Limit cannot exceed 100')
  }

  return {
    isValid: errors.length === 0,
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum)),
    errors,
  }
}

/**
 * Validate required fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = []

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validation middleware factory
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { isValid, errors } = schema.validate(req.body)
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors,
        })
      }
      
      next()
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }
}

/**
 * Tirth validation schema
 */
export const tirtValidationSchema = {
  validate: (data) => {
    const errors = []

    if (!data.name || !validators.isValidString(data.name, 1, 100)) {
      errors.push('name must be a string between 1 and 100 characters')
    }

    if (data.latitude !== undefined && !validators.isValidCoordinate(data.latitude, data.longitude)) {
      errors.push('latitude and longitude must be valid coordinates')
    }

    if (data.city && !validators.isValidString(data.city, 1, 100)) {
      errors.push('city must be a string between 1 and 100 characters')
    }

    if (data.rating !== undefined && (!validators.isValidNonNegativeNumber(data.rating) || data.rating > 5)) {
      errors.push('rating must be a number between 0 and 5')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}

/**
 * Auth validation schema
 */
export const authValidationSchema = {
  validateRegister: (data) => {
    const errors = []

    if (!data.email || !validators.isValidEmail(data.email)) {
      errors.push('email must be a valid email address')
    }

    if (!data.password || !validators.isValidString(data.password, 8, 100)) {
      errors.push('password must be at least 8 characters long')
    }

    if (!data.name || !validators.isValidString(data.name, 2, 100)) {
      errors.push('name must be a string between 2 and 100 characters')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  validateLogin: (data) => {
    const errors = []

    if (!data.email || !validators.isValidEmail(data.email)) {
      errors.push('email must be a valid email address')
    }

    if (!data.password || !validators.isValidString(data.password, 1, 100)) {
      errors.push('password is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}

/**
 * Dharamshala validation schema
 */
export const dharamshalaValidationSchema = {
  validate: (data) => {
    const errors = []

    if (!data.name || !validators.isValidString(data.name, 1, 100)) {
      errors.push('name must be a string between 1 and 100 characters')
    }

    if (data.city && !validators.isValidString(data.city, 1, 100)) {
      errors.push('city must be a string between 1 and 100 characters')
    }

    if (data.rating !== undefined && (!validators.isValidNonNegativeNumber(data.rating) || data.rating > 5)) {
      errors.push('rating must be a number between 0 and 5')
    }

    if (data.phone && !validators.isValidPhone(data.phone)) {
      errors.push('phone must be a valid phone number')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}

/**
 * Booking validation schema
 */
export const bookingValidationSchema = {
  validate: (data) => {
    const errors = []

    if (!data.dharamshalaId || !validators.isValidString(data.dharamshalaId, 1, 100)) {
      errors.push('dharamshalaId is required')
    }

    if (!data.roomId || !validators.isValidString(data.roomId, 1, 100)) {
      errors.push('roomId is required')
    }

    if (!data.checkInDate || !validators.isValidDate(data.checkInDate)) {
      errors.push('checkInDate must be a valid date')
    }

    if (!data.checkOutDate || !validators.isValidDate(data.checkOutDate)) {
      errors.push('checkOutDate must be a valid date')
    }

    if (data.checkInDate && data.checkOutDate && new Date(data.checkInDate) >= new Date(data.checkOutDate)) {
      errors.push('checkOutDate must be after checkInDate')
    }

    if (data.numberOfGuests && !validators.isValidPositiveNumber(data.numberOfGuests)) {
      errors.push('numberOfGuests must be a positive number')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },
}
