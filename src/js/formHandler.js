// Form validation and submission handler
class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.initializeForm();
    }

    initializeForm() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                await this.submitForm();
            }
        });

        // Real-time validation
        this.form.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
                errorMessage = isValid ? '' : 'Будь ласка, введіть дійсну електронну адресу';
                break;
            case 'tel':
                const phoneRegex = /^\+?[\d\s-]{10,}$/;
                isValid = phoneRegex.test(value);
                errorMessage = isValid ? '' : 'Будь ласка, введіть дійсний номер телефону';
                break;
            default:
                isValid = value.length > 0;
                errorMessage = isValid ? '' : 'Це поле є обов\'язковим';
        }

        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    validateForm() {
        let isValid = true;
        this.form.querySelectorAll('input, textarea').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    }

    showFieldValidation(field, isValid, message) {
        const errorElement = field.nextElementSibling?.classList.contains('error-message') 
            ? field.nextElementSibling 
            : document.createElement('span');
        
        if (!field.nextElementSibling?.classList.contains('error-message')) {
            errorElement.classList.add('error-message', 'text-sm', 'text-red-500', 'mt-1');
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }

        if (!isValid) {
            field.classList.add('border-red-500');
            field.classList.remove('border-green-500');
            errorElement.textContent = message;
        } else {
            field.classList.remove('border-red-500');
            field.classList.add('border-green-500');
            errorElement.textContent = '';
        }
    }

    async submitForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/crm/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            this.showSubmissionMessage(true, 'Дякуємо! Ми зв\'яжемося з вами найближчим часом.');
            this.form.reset();
            this.resetValidationStyles();
        } catch (error) {
            console.error('Error:', error);
            this.showSubmissionMessage(false, 'Вибачте, сталася помилка. Спробуйте ще раз пізніше.');
        }
    }

    showSubmissionMessage(isSuccess, message) {
        const messageElement = document.getElementById('form-message') || document.createElement('div');
        messageElement.id = 'form-message';
        messageElement.classList.add('mt-4', 'p-4', 'rounded', isSuccess ? 'bg-green-100' : 'bg-red-100');
        messageElement.textContent = message;

        if (!document.getElementById('form-message')) {
            this.form.parentNode.insertBefore(messageElement, this.form.nextSibling);
        }

        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }

    resetValidationStyles() {
        this.form.querySelectorAll('input, textarea').forEach(field => {
            field.classList.remove('border-red-500', 'border-green-500');
            const errorElement = field.nextElementSibling;
            if (errorElement?.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        });
    }
}

export default FormHandler;
