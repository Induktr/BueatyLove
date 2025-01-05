/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validates a phone number (Ukrainian format)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^(?:\+38)?(?:0\d{9})$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validates required fields in a form
 * @param {Object} fields - Object containing field names and values
 * @returns {Object} - Object containing validation errors
 */
export const validateRequired = (fields) => {
    const errors = {}
    
    Object.entries(fields).forEach(([field, value]) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field] = 'Це поле обов\'язкове'
        }
    })
    
    return errors
}

/**
 * Validates a booking form
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Object containing validation errors
 */
export const validateBookingForm = (formData) => {
    const errors = {}

    // Required fields
    const requiredErrors = validateRequired({
        name: formData.name,
        phone: formData.phone,
        service: formData.service,
        date: formData.date
    })
    Object.assign(errors, requiredErrors)

    // Phone validation
    if (formData.phone && !isValidPhone(formData.phone)) {
        errors.phone = 'Невірний формат номера телефону'
    }

    // Email validation (if provided)
    if (formData.email && !isValidEmail(formData.email)) {
        errors.email = 'Невірний формат email'
    }

    // Date validation
    if (formData.date) {
        const selectedDate = new Date(formData.date)
        const now = new Date()
        
        if (selectedDate < now) {
            errors.date = 'Дата не може бути в минулому'
        }
    }

    return errors
}

/**
 * Validates a contact form
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Object containing validation errors
 */
export const validateContactForm = (formData) => {
    const errors = {}

    // Required fields
    const requiredErrors = validateRequired({
        name: formData.name,
        email: formData.email,
        message: formData.message
    })
    Object.assign(errors, requiredErrors)

    // Email validation
    if (formData.email && !isValidEmail(formData.email)) {
        errors.email = 'Невірний формат email'
    }

    // Message length validation
    if (formData.message && formData.message.length < 10) {
        errors.message = 'Повідомлення має містити щонайменше 10 символів'
    }

    return errors
}
