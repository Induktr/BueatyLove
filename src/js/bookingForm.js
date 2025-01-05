import FormHandler from './formHandler';

class BookingForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formHandler = new FormHandler('booking-form');
        this.initializeForm();
    }

    initializeForm() {
        // Initialize navigation buttons
        this.prevButton = document.getElementById('prev-step');
        this.nextButton = document.getElementById('next-step');
        this.submitButton = document.getElementById('submit-form');

        // Check if all required elements exist
        if (!this.prevButton || !this.nextButton || !this.submitButton) {
            console.error('Navigation buttons not found. Please check the HTML structure.');
            return;
        }
        
        this.setupEventListeners();
        this.loadServices();
        this.setupDateTimeValidation();
        
        // Initialize button states
        this.updateNavigationButtons(this.currentStep);
    }

    setupEventListeners() {
        if (this.prevButton && this.nextButton) {
            this.prevButton.addEventListener('click', () => this.navigateStep(-1));
            this.nextButton.addEventListener('click', () => this.navigateStep(1));
        }
        
        // Update available time slots when date changes
        const dateInput = document.querySelector('input[type="date"]');
        dateInput?.addEventListener('change', () => this.loadTimeSlots(dateInput.value));
    }

    getMockServices() {
        return [
            {
                id: 1,
                name: "Стрижка",
                description: "Професійна стрижка будь-якої складності",
                price: 500
            },
            {
                id: 2,
                name: "Фарбування",
                description: "Фарбування волосся з використанням якісних матеріалів",
                price: 1200
            },
            {
                id: 3,
                name: "Укладка",
                description: "Професійна укладка волосся",
                price: 600
            }
        ];
    }

    async loadServices() {
        const serviceContainer = document.querySelector('#step-1 .md\\:grid-cols-3');
        if (!serviceContainer) {
            console.error('Service container not found in DOM');
            return;
        }

        try {
            let services;
            
            // Try to fetch from API first
            try {
                const response = await fetch('/api/services');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new TypeError('Received non-JSON response from server');
                }

                services = await response.json();
                
            } catch (apiError) {
                console.log('API not available, using mock data:', apiError);
                // Fallback to mock data if API fails
                services = this.getMockServices();
            }

            // Validate services data
            if (!Array.isArray(services)) {
                throw new TypeError('Expected services to be an array');
            }

            // Clear existing content
            serviceContainer.innerHTML = '';
            
            // Add default service option if no services
            if (services.length === 0) {
                serviceContainer.innerHTML = `
                    <div class="col-span-3 p-4 text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded-lg text-center">
                        <p>Наразі немає доступних послуг</p>
                    </div>
                `;
                return;
            }

            // Create and append service options
            services.forEach(service => {
                try {
                    const serviceDiv = document.createElement('div');
                    serviceDiv.className = 'service-option';
                    
                    // Sanitize data
                    const sanitizedService = {
                        id: String(service.id || '').replace(/[^\w-]/g, ''),
                        name: String(service.name || '').replace(/[<>]/g, ''),
                        description: String(service.description || '').replace(/[<>]/g, ''),
                        price: Number(service.price) || 0
                    };

                    serviceDiv.innerHTML = `
                        <input type="radio" 
                               name="service" 
                               id="service-${sanitizedService.id}" 
                               value="${sanitizedService.id}" 
                               class="hidden peer" 
                               required>
                        <label for="service-${sanitizedService.id}" 
                               class="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-lightBrown dark:hover:border-primary-darkBrown transition-colors peer-checked:border-primary-lightBrown dark:peer-checked:border-primary-darkBrown">
                            <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                                ${sanitizedService.name}
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                ${sanitizedService.description}
                            </p>
                            <p class="text-sm font-medium mt-2 text-primary-darkBrown dark:text-primary-lightBrown">
                                ${sanitizedService.price} грн
                            </p>
                        </label>
                    `;
                    
                    serviceContainer.appendChild(serviceDiv);
                } catch (err) {
                    console.error('Error creating service element:', err);
                }
            });

        } catch (error) {
            console.error('Error loading services:', error);
            
            // Show user-friendly error message
            if (serviceContainer) {
                serviceContainer.innerHTML = `
                    <div class="col-span-3 p-4 text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-center">
                        <p>Помилка завантаження послуг. Будь ласка, спробуйте пізніше.</p>
                        <p class="text-sm mt-2">${error.message}</p>
                    </div>
                `;
            }
        }
    }

    async loadTimeSlots(date) {
        try {
            const response = await fetch(`/api/timeslots?date=${date}`);
            const timeSlots = await response.json();
            
            const timeSelect = document.querySelector('select[name="time"]');
            const defaultOption = timeSelect.querySelector('option[value=""]');
            
            timeSelect.innerHTML = '';
            timeSelect.appendChild(defaultOption);
            
            timeSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.value;
                option.textContent = slot.label;
                timeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading time slots:', error);
        }
    }

    setupDateTimeValidation() {
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
            // Set min date to today
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Set max date to 2 months from now
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 2);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
    }

    updateNavigationButtons(step) {
        // Early return if buttons don't exist
        if (!this.prevButton || !this.nextButton || !this.submitButton) {
            console.error('Navigation buttons not found');
            return;
        }

        // Update previous button
        if (this.prevButton) {
            this.prevButton.classList.toggle('hidden', step === 1);
            this.prevButton.disabled = step === 1;
        }

        // Update next button
        if (this.nextButton) {
            this.nextButton.classList.toggle('hidden', step === this.totalSteps);
            this.nextButton.disabled = step === this.totalSteps;
        }

        // Update submit button
        if (this.submitButton) {
            this.submitButton.classList.toggle('hidden', step !== this.totalSteps);
            this.submitButton.disabled = step !== this.totalSteps;
        }
    }

    navigateStep(direction) {
        const newStep = this.currentStep + direction;
        
        if (newStep < 1 || newStep > this.totalSteps) return;
        
        if (direction > 0 && !this.validateCurrentStep()) return;
        
        this.updateStepVisibility(newStep);
        this.updateNavigationButtons(newStep);
        this.currentStep = newStep;
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        const fields = currentStepElement.querySelectorAll('input, select, textarea');
        
        let isValid = true;
        fields.forEach(field => {
            if (field.required && !field.value) {
                isValid = false;
                this.formHandler.showFieldValidation(field, false, 'Це поле є обов\'язковим');
            }
        });
        
        return isValid;
    }

    updateStepVisibility(newStep) {
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.add('hidden');
        });
        document.getElementById(`step-${newStep}`).classList.remove('hidden');
    }
}

// Initialize the booking form
document.addEventListener('DOMContentLoaded', () => {
    new BookingForm();
});
