import { submitBookingForm, getAvailableTimeSlots } from '../services/forms.js'

class BookingForm {
    constructor(formElement) {
        this.form = formElement
        this.errors = {}
        this.timeSlots = []
        this.isSubmitting = false

        this.initializeForm()
    }

    initializeForm() {
        // Initialize date picker
        const dateInput = this.form.querySelector('[name="date"]')
        if (dateInput) {
            // Set min date to today
            const today = new Date().toISOString().split('T')[0]
            dateInput.min = today
            
            // Listen for date changes
            dateInput.addEventListener('change', () => this.handleDateChange())
        }

        // Initialize service select
        const serviceSelect = this.form.querySelector('[name="service"]')
        if (serviceSelect) {
            serviceSelect.addEventListener('change', () => this.handleServiceChange())
        }

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e))
    }

    async handleDateChange() {
        const dateInput = this.form.querySelector('[name="date"]')
        const serviceSelect = this.form.querySelector('[name="service"]')
        const timeSlotsContainer = this.form.querySelector('.time-slots')

        if (dateInput.value && serviceSelect.value && timeSlotsContainer) {
            try {
                // Show loading state
                timeSlotsContainer.innerHTML = '<p>Завантаження доступного часу...</p>'

                // Fetch available time slots
                const slots = await getAvailableTimeSlots(dateInput.value, serviceSelect.value)
                this.timeSlots = slots

                // Render time slots
                this.renderTimeSlots(timeSlotsContainer)
            } catch (error) {
                timeSlotsContainer.innerHTML = '<p class="form-error">Помилка завантаження розкладу</p>'
            }
        }
    }

    handleServiceChange() {
        const dateInput = this.form.querySelector('[name="date"]')
        if (dateInput.value) {
            this.handleDateChange()
        }
    }

    renderTimeSlots(container) {
        if (!this.timeSlots.length) {
            container.innerHTML = '<p>Немає доступного часу на цю дату</p>'
            return
        }

        const html = `
            <div class="grid grid-cols-3 gap-2 mt-4">
                ${this.timeSlots.map(slot => `
                    <button type="button"
                        class="btn ${slot.available ? 'btn-outline' : 'btn-secondary opacity-50 cursor-not-allowed'}"
                        ${!slot.available ? 'disabled' : ''}
                        data-time="${slot.time}">
                        ${slot.time}
                    </button>
                `).join('')}
            </div>
        `

        container.innerHTML = html

        // Add click handlers to time slot buttons
        container.querySelectorAll('button[data-time]').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', () => this.selectTimeSlot(button))
            }
        })
    }

    selectTimeSlot(button) {
        // Remove active class from all buttons
        this.form.querySelectorAll('button[data-time]').forEach(btn => {
            btn.classList.remove('bg-pink-600', 'text-white')
        })

        // Add active class to selected button
        button.classList.add('bg-pink-600', 'text-white')

        // Update hidden time input
        const timeInput = this.form.querySelector('[name="time"]')
        if (timeInput) {
            timeInput.value = button.dataset.time
        }
    }

    async handleSubmit(e) {
        e.preventDefault()

        if (this.isSubmitting) return

        this.isSubmitting = true
        this.clearErrors()

        const submitButton = this.form.querySelector('[type="submit"]')
        const originalButtonText = submitButton.textContent
        submitButton.textContent = 'Відправка...'
        submitButton.disabled = true

        try {
            const formData = new FormData(this.form)
            const data = Object.fromEntries(formData.entries())

            const response = await submitBookingForm(data)
            
            // Show success message
            this.showMessage(response.message, 'success')
            
            // Reset form
            this.form.reset()
            
        } catch (error) {
            if (error.cause) {
                // Validation errors
                this.showErrors(error.cause)
            } else {
                // General error
                this.showMessage(error.message, 'error')
            }
        } finally {
            this.isSubmitting = false
            submitButton.textContent = originalButtonText
            submitButton.disabled = false
        }
    }

    clearErrors() {
        this.form.querySelectorAll('.form-error').forEach(el => el.remove())
        this.errors = {}
    }

    showErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const input = this.form.querySelector(`[name="${field}"]`)
            if (input) {
                const errorElement = document.createElement('p')
                errorElement.className = 'form-error'
                errorElement.textContent = message
                input.parentNode.appendChild(errorElement)
            }
        })
    }

    showMessage(message, type = 'success') {
        const messageElement = document.createElement('div')
        messageElement.className = `form-${type} text-center p-4 rounded-lg mb-4`
        messageElement.textContent = message

        this.form.insertBefore(messageElement, this.form.firstChild)

        // Remove message after 5 seconds
        setTimeout(() => {
            messageElement.remove()
        }, 5000)
    }
}

export default BookingForm
