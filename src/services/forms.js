import { validateBookingForm, validateContactForm } from '../utils/validation'

/**
 * Simulates an API call delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Resolves after the delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Handles booking form submission
 * @param {Object} formData - The form data to submit
 * @returns {Promise} - Resolves with success message or rejects with error
 */
export const submitBookingForm = async (formData) => {
    // Validate form data
    const errors = validateBookingForm(formData)
    if (Object.keys(errors).length > 0) {
        throw new Error('Validation failed', { cause: errors })
    }

    try {
        // Simulate API call
        await delay(1000)

        // TODO: Replace with actual API call
        console.log('Booking form submitted:', formData)

        return {
            success: true,
            message: 'Дякуємо за запис! Ми зв\'яжемося з вами найближчим часом для підтвердження.'
        }
    } catch (error) {
        console.error('Error submitting booking form:', error)
        throw new Error('Не вдалося відправити форму. Спробуйте пізніше.')
    }
}

/**
 * Handles contact form submission
 * @param {Object} formData - The form data to submit
 * @returns {Promise} - Resolves with success message or rejects with error
 */
export const submitContactForm = async (formData) => {
    // Validate form data
    const errors = validateContactForm(formData)
    if (Object.keys(errors).length > 0) {
        throw new Error('Validation failed', { cause: errors })
    }

    try {
        // Simulate API call
        await delay(1000)

        // TODO: Replace with actual API call
        console.log('Contact form submitted:', formData)

        return {
            success: true,
            message: 'Дякуємо за ваше повідомлення! Ми відповімо вам найближчим часом.'
        }
    } catch (error) {
        console.error('Error submitting contact form:', error)
        throw new Error('Не вдалося відправити форму. Спробуйте пізніше.')
    }
}

/**
 * Fetches available time slots for a given date
 * @param {string} date - The date to check
 * @param {string} service - The service type
 * @returns {Promise} - Resolves with available time slots
 */
export const getAvailableTimeSlots = async (date, service) => {
    try {
        // Simulate API call
        await delay(500)

        // TODO: Replace with actual API call
        // This is mock data
        const timeSlots = [
            { time: '09:00', available: true },
            { time: '10:00', available: true },
            { time: '11:00', available: false },
            { time: '12:00', available: true },
            { time: '13:00', available: false },
            { time: '14:00', available: true },
            { time: '15:00', available: true },
            { time: '16:00', available: true },
            { time: '17:00', available: false }
        ]

        return timeSlots
    } catch (error) {
        console.error('Error fetching time slots:', error)
        throw new Error('Не вдалося отримати доступний час. Спробуйте пізніше.')
    }
}
