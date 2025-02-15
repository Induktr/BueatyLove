import FormHandler from './formHandler';

export default class BookingForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formHandler = new FormHandler('booking-form');
        this.timeSlotCache = new Map();
        this.servicesCache = null;
        this.servicesLastFetch = 0;
        
        // Bind methods to preserve this context
        this.isValidSlot = this.isValidSlot.bind(this);
        
        // Ensure the form exists before initialization
        const form = document.getElementById('booking-form');
        if (!form) {
            console.error('Booking form not found in the DOM');
            return;
        }
        
        this.initializeForm();
    }

    initializeForm() {
        try {
            this.initializeNavigation();
            this.setupEventListeners();
            this.loadServices();
            this.setupDateTimeValidation();
        } catch (error) {
            console.error('Error initializing booking form:', error);
        }
    }

    initializeNavigation() {
        // Initialize navigation buttons
        this.prevButton = document.getElementById('prev-step');
        this.nextButton = document.getElementById('next-step');
        this.submitButton = document.getElementById('submit-booking');

        if (!this.prevButton || !this.nextButton || !this.submitButton) {
            throw new Error('Navigation buttons not found. Please check the HTML structure.');
        }

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
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                const selectedDate = dateInput.value;
                if (this.isValidDate(selectedDate)) {
                    this.loadTimeSlots(selectedDate);
                } else {
                    this.showError('Будь ласка, виберіть коректну дату');
                }
            });
        }
    }

    static API_CONFIG = {
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
        CACHE_DURATION: 3600000, // 1 hour in milliseconds
        ENDPOINTS: {
            TIMESLOTS: '/api/timeslots',
            SERVICES: '/api/services',
            HEALTH: '/api/health'
        },
        HEADERS: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        }
    };

    async loadServices() {
        const serviceContainer = document.querySelector('#step-1 .md\\:grid-cols-3');
        if (!serviceContainer) {
            console.error('Service container not found in DOM');
            return;
        }

        try {
            // Show loading state
            serviceContainer.innerHTML = `
                <div class="col-span-3 p-4 text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded-lg text-center">
                    <p>Завантаження послуг...</p>
                </div>
            `;

            // Check cache first
            const now = Date.now();
            if (this.servicesCache && (now - this.servicesLastFetch) < BookingForm.API_CONFIG.CACHE_DURATION) {
                this.updateServicesUI(this.servicesCache);
                return;
            }

            // Fetch from API with retry logic
            const response = await this.retryOperation(async () => {
                try {
                    const response = await fetch(BookingForm.API_CONFIG.ENDPOINTS.SERVICES, {
                        method: 'GET',
                        headers: BookingForm.API_CONFIG.HEADERS
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    // Check content type
                    if (!this.isJsonResponse(response)) {
                        throw new TypeError('Received non-JSON response from server');
                    }

                    const data = await this.parseJsonResponse(response);

                    // Validate response structure
                    if (!data || typeof data !== 'object') {
                        throw new Error('Invalid response format');
                    }

                    if (data.status !== 'success' || !Array.isArray(data.data)) {
                        throw new Error(data.error || 'Invalid data format');
                    }

                    return data;
                } catch (error) {
                    console.error('Services API Error:', error);
                    throw error;
                }
            });

            // Update cache
            this.servicesCache = response.data;
            this.servicesLastFetch = now;

            // Update UI
            this.updateServicesUI(response.data);

        } catch (error) {
            console.error('Error loading services:', error);
            
            // Try to use cached data if available
            if (this.servicesCache) {
                this.updateServicesUI(this.servicesCache);
                this.showError('Використовуємо збережені дані через тимчасові проблеми');
                return;
            }

            // Fallback to mock data
            const mockServices = this.getMockServices();
            this.updateServicesUI(mockServices);
            this.showError('Помилка завантаження. Використовуємо тестові дані.');
        }
    }

    getMockServices() {
        return [
            {
                id: 1,
                name: "Стрижка",
                description: "Професійна стрижка будь-якої складності",
                price: 500,
                duration: 60
            },
            {
                id: 2,
                name: "Фарбування",
                description: "Фарбування волосся з використанням якісних матеріалів",
                price: 1200,
                duration: 90
            },
            {
                id: 3,
                name: "Укладка",
                description: "Професійна укладка волосся",
                price: 600,
                duration: 30
            }
        ];
    }

    /**
     * Update services UI with provided data
     * @param {Array} services - Array of service objects
     */
    updateServicesUI(services) {
        const serviceContainer = document.querySelector('#step-1 .md\\:grid-cols-3');
        if (!serviceContainer) {
            console.error('Service container not found');
            return;
        }

        try {
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
                        price: Number(service.price) || 0,
                        duration: Number(service.duration) || 60
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
                            <div class="flex justify-between items-center mt-2">
                                <p class="text-sm font-medium text-primary-darkBrown dark:text-primary-lightBrown">
                                    ${sanitizedService.price} грн
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    ${sanitizedService.duration} хв
                                </p>
                            </div>
                        </label>
                    `;
                    
                    serviceContainer.appendChild(serviceDiv);
                } catch (err) {
                    console.error('Error creating service element:', err);
                }
            });
        } catch (error) {
            console.error('Error updating services UI:', error);
            
            // Show user-friendly error message
            serviceContainer.innerHTML = `
                <div class="col-span-3 p-4 text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-center">
                    <p>Помилка відображення послуг</p>
                    <p class="text-sm mt-2">${error.message}</p>
                </div>
            `;
        }
    }

    isJsonResponse(response) {
        const contentType = response.headers.get('content-type');
        // Check if content type exists and includes 'application/json', ignoring case and whitespace
        return contentType && contentType.toLowerCase().replace(/\s/g, '').includes('application/json');
    }

    async parseJsonResponse(response) {
        try {
            const text = await response.text();
            
            // Remove any comments or invalid characters
            const cleanText = text.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
                                .trim();
            
            if (!cleanText) {
                throw new Error('Empty response received');
            }

            try {
                return JSON.parse(cleanText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response Text:', cleanText);
                throw new Error('Неправильний формат відповіді сервера');
            }
        } catch (error) {
            console.error('Response Processing Error:', error);
            throw error;
        }
    }

    async loadTimeSlots(date) {
        try {
            // Validate date first
            if (!this.isValidDate(date)) {
                throw new Error('Будь ласка, виберіть коректну дату');
            }

            // Try to get cached data first
            const cachedSlots = this.getCachedTimeSlots(date);
            if (cachedSlots) {
                this.updateTimeSlotsUI(cachedSlots);
                return;
            }

            this.showLoadingState();

            // Format date for API
            const formattedDate = this.formatDateForApi(date);

            // Fetch time slots with retry logic
            const response = await this.retryOperation(async () => {
                try {
                    const response = await fetch(`${BookingForm.API_CONFIG.ENDPOINTS.TIMESLOTS}?date=${formattedDate}`, {
                        method: 'GET',
                        headers: BookingForm.API_CONFIG.HEADERS
                    });

                    if (!response.ok) {
                        const errorData = await this.parseJsonResponse(response).catch(() => ({}));
                        throw new Error(errorData.error || `Помилка сервера: ${response.status}`);
                    }

                    // Check content type and warn if not application/json
                    if (!this.isJsonResponse(response)) {
                        console.warn('Unexpected content type:', response.headers.get('content-type'));
                    }

                    const data = await this.parseJsonResponse(response);

                    // Validate response structure
                    if (!data || typeof data !== 'object') {
                        throw new Error('Неправильний формат відповіді');
                    }

                    if (data.status !== 'success' || !Array.isArray(data.data)) {
                        throw new Error(data.error || 'Неправильний формат даних');
                    }

                    return data;
                } catch (error) {
                    console.error('API Request Error:', error);
                    throw error;
                }
            });

            const slots = response.data;

            // Validate slot format
            if (!Array.isArray(slots)) {
                throw new Error('Неправильний формат даних слотів');
            }

            // Validate each slot
            const invalidSlots = slots.filter(slot => !this.isValidSlot(slot));
            if (invalidSlots.length > 0) {
                console.error('Invalid slots found:', invalidSlots);
                throw new Error('Неправильний формат часових слотів');
            }

            // Sort slots by timestamp
            slots.sort((a, b) => a.timestamp - b.timestamp);

            // Cache and display valid slots
            this.cacheTimeSlots(date, slots);
            this.updateTimeSlotsUI(slots);

        } catch (error) {
            console.error('Error loading time slots:', error);
            
            // Try to use cached data
            const cachedSlots = this.getCachedTimeSlots(date);
            if (cachedSlots) {
                this.updateTimeSlotsUI(cachedSlots);
                this.showError('Використовуємо збережені дані через тимчасові проблеми');
                return;
            }

            // Show error message
            this.showError(error.message || 'Помилка завантаження часових слотів');
            
            // Clear time slots UI
            this.updateTimeSlotsUI([]);
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Validate date format and range
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @returns {boolean} True if date is valid
     */
    isValidDate(dateStr) {
        try {
            if (!dateStr || typeof dateStr !== 'string') {
                return false;
            }

            // Check format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return false;
            }

            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return false;
            }

            // Get current date without time
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get max date (30 days from now)
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            maxDate.setHours(23, 59, 59, 999);

            // Check if date is within valid range
            return date >= today && date <= maxDate;
        } catch (error) {
            console.error('Date validation error:', error);
            return false;
        }
    }

    /**
     * Format date for API request
     * @param {string} dateStr - Date string
     * @returns {string} Formatted date string
     */
    formatDateForApi(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Date formatting error:', error);
            throw new Error('Неправильний формат дати');
        }
    }

    /**
     * Cache time slots for a specific date
     * @param {string} date - The date in YYYY-MM-DD format
     * @param {Array} slots - Array of time slot objects
     */
    cacheTimeSlots(date, slots) {
        try {
            if (!date || !Array.isArray(slots)) {
                console.warn('Invalid data for caching time slots');
                return;
            }

            const cacheData = {
                slots,
                timestamp: Date.now()
            };

            // Store in both memory and localStorage for redundancy
            this.timeSlotCache.set(date, cacheData);
            localStorage.setItem(`timeSlots_${date}`, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error caching time slots:', error);
        }
    }

    /**
     * Get cached time slots for a specific date
     * @param {string} date - The date in YYYY-MM-DD format
     * @returns {Array|null} Array of time slots or null if not found/expired
     */
    getCachedTimeSlots(date) {
        try {
            // First try memory cache
            const memoryCache = this.timeSlotCache.get(date);
            if (memoryCache && Date.now() - memoryCache.timestamp < BookingForm.API_CONFIG.CACHE_DURATION) {
                return memoryCache.slots;
            }

            // Then try localStorage
            const stored = localStorage.getItem(`timeSlots_${date}`);
            if (stored) {
                const { slots, timestamp } = JSON.parse(stored);
                if (Date.now() - timestamp < BookingForm.API_CONFIG.CACHE_DURATION) {
                    // Update memory cache
                    this.timeSlotCache.set(date, { slots, timestamp });
                    return slots;
                }
                // Remove expired cache
                localStorage.removeItem(`timeSlots_${date}`);
                this.timeSlotCache.delete(date);
            }
        } catch (error) {
            console.warn('Error reading from cache:', error);
            this.clearInvalidCache();
        }
        return null;
    }

    /**
     * Clear invalid or expired cache entries
     */
    clearInvalidCache() {
        try {
            // Clear memory cache
            for (const [date, data] of this.timeSlotCache.entries()) {
                if (Date.now() - data.timestamp >= BookingForm.API_CONFIG.CACHE_DURATION) {
                    this.timeSlotCache.delete(date);
                }
            }

            // Clear localStorage cache
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('timeSlots_')) {
                    try {
                        const { timestamp } = JSON.parse(localStorage.getItem(key));
                        if (Date.now() - timestamp >= BookingForm.API_CONFIG.CACHE_DURATION) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Error clearing invalid cache:', error);
        }
    }

    showLoadingState() {
        const container = document.querySelector('.time-slots-container');
        if (container) {
            container.innerHTML = `
                <div class="col-span-3 flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-lightBrown"></div>
                </div>
            `;
        }
    }

    hideLoadingState() {
        // Loading state will be replaced by updateTimeSlotsUI
    }

    getMockTimeSlots() {
        const currentHour = new Date().getHours();
        return Array.from({ length: 9 }, (_, index) => {
            const hour = index + 10; // Start from 10:00
            return {
                time: `${hour.toString().padStart(2, '0')}:00`,
                available: hour > currentHour
            };
        });
    }

    updateTimeSlotsUI(slots) {
        const container = document.querySelector('.time-slots-container');
        if (!container) {
            console.error('Time slots container not found');
            return;
        }

        container.innerHTML = slots.map(slot => `
            <button type="button" 
                    class="time-slot ${!slot.available ? 'disabled' : ''} px-4 py-3 rounded-lg border 
                           ${slot.available ? 'border-gray-300 hover:border-primary-mediumBrown hover:bg-primary-lightBrown/10' : 'border-gray-200 bg-gray-100'} 
                           focus:outline-none focus:ring-2 focus:ring-primary-lightBrown dark:border-gray-700 
                           transition-all"
                    ${!slot.available ? 'disabled' : ''}
                    data-time="${slot.time}">
                ${slot.time}
            </button>
        `).join('');

        // Add click handlers to new buttons
        container.querySelectorAll('.time-slot:not(.disabled)').forEach(button => {
            button.addEventListener('click', () => this.handleTimeSlotSelection(button));
        });
    }

    setupDateTimeValidation() {
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
            // Set min date to today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateInput.min = today.toISOString().split('T')[0];
            
            // Set max date to 30 days from now
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            maxDate.setHours(23, 59, 59, 999);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
    }

    updateNavigationButtons(step) {
        if (!this.prevButton || !this.nextButton || !this.submitButton) {
            return; // Silently return if buttons are not initialized
        }

        // Update previous button
        this.prevButton.classList.toggle('hidden', step === 1);
        this.prevButton.disabled = step === 1;

        // Update next button
        this.nextButton.classList.toggle('hidden', step === this.totalSteps);
        this.nextButton.disabled = step === this.totalSteps;

        // Update submit button
        this.submitButton.classList.toggle('hidden', step !== this.totalSteps);
        this.submitButton.disabled = step !== this.totalSteps;
    }

    navigateStep(direction) {
        const newStep = this.currentStep + direction;
        
        if (newStep < 1 || newStep > this.totalSteps) return;
        
        if (direction > 0 && !this.validateCurrentStep()) return;

        // Hide all steps first
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.add('hidden');
        });
        
        // Show the new step
        const nextStep = document.getElementById(`step-${newStep}`);
        if (nextStep) {
            nextStep.classList.remove('hidden');
            this.currentStep = newStep;
            this.updateNavigationButtons(newStep);
        }
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

    showError(message) {
        const errorContainer = document.querySelector('.booking-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        }
    }

    handleTimeSlotSelection(button) {
        // Remove selection from other buttons
        document.querySelectorAll('.time-slot').forEach(btn => 
            btn.classList.remove('selected', 'border-primary-mediumBrown', 'bg-primary-lightBrown/10'));
        
        // Add selection to clicked button
        button.classList.add('selected', 'border-primary-mediumBrown', 'bg-primary-lightBrown/10');
        
        // Store selected time
        this.selectedTime = button.dataset.time;
    }

    async checkServerHealth() {
        try {
            const response = await fetch(BookingForm.API_CONFIG.ENDPOINTS.HEALTH, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error);
            return false;
        }
    }

    async retryOperation(operation, retries = BookingForm.API_CONFIG.MAX_RETRIES) {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, BookingForm.API_CONFIG.RETRY_DELAY * (i + 1)));
                console.warn(`Retry attempt ${i + 1} of ${retries}`);
            }
        }
    }

    /**
     * Validate a time slot object
     * @param {Object} slot - Time slot object to validate
     * @returns {boolean} True if slot is valid
     */
    isValidSlot(slot) {
        try {
            if (!slot || typeof slot !== 'object') {
                console.warn('Invalid slot: not an object', slot);
                return false;
            }

            // Required fields
            const requiredFields = {
                time: 'string',
                available: 'boolean',
                duration: 'number',
                timestamp: 'number'
            };

            // Check all required fields
            for (const [field, type] of Object.entries(requiredFields)) {
                if (!(field in slot)) {
                    console.warn(`Invalid slot: missing ${field}`, slot);
                    return false;
                }
                if (typeof slot[field] !== type) {
                    console.warn(`Invalid slot: ${field} should be ${type}`, slot);
                    return false;
                }
            }

            // Validate time format (HH:mm)
            if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.time)) {
                console.warn('Invalid slot: invalid time format', slot);
                return false;
            }

            // Validate duration (positive number)
            if (slot.duration <= 0) {
                console.warn('Invalid slot: duration must be positive', slot);
                return false;
            }

            // Validate timestamp (valid date)
            const date = new Date(slot.timestamp);
            if (isNaN(date.getTime())) {
                console.warn('Invalid slot: invalid timestamp', slot);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating slot:', error);
            return false;
        }
    }
}
