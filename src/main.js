import BookingForm from './components/BookingForm.js'
import { animationController } from './js/animations.js'
import { initIcons } from './js/icons.js'
import { translations } from './js/translations.js'
import './js/bookingForm'; // Import booking form functionality

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const html = document.documentElement;
    const isDark = localStorage.getItem('theme') === 'dark';
    const themeTexts = document.querySelectorAll('[data-translate="dark_mode"], [data-translate="light_mode"]');

    function updateThemeText(isDarkMode) {
        themeTexts.forEach(text => {
            text.setAttribute('data-translate', isDarkMode ? 'light_mode' : 'dark_mode');
            const currentLang = localStorage.getItem('preferred-language') || 'uk';
            text.textContent = translations[currentLang][isDarkMode ? 'light_mode' : 'dark_mode'];
        });
    }

    // Set initial theme
    if (isDark) {
        html.classList.add('dark');
        updateThemeText(true);
    }

    function toggleTheme() {
        const willBeDark = !html.classList.contains('dark');
        html.classList.toggle('dark');
        localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
        updateThemeText(willBeDark);
    }

    // Desktop theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Mobile theme toggle
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
}

// Burger menu functionality
function initBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const burgerIcon = burgerButton?.querySelector('.burger-icon');
    const closeIcon = burgerButton?.querySelector('.close-icon');

    if (burgerButton && mobileMenu) {
        burgerButton.addEventListener('click', () => {
            // Toggle menu visibility
            mobileMenu.classList.toggle('hidden');
            
            // Toggle icons
            if (burgerIcon && closeIcon) {
                burgerIcon.classList.toggle('hidden');
                closeIcon.classList.toggle('hidden');
            }
            
            // Update aria-expanded
            const isExpanded = !mobileMenu.classList.contains('hidden');
            burgerButton.setAttribute('aria-expanded', isExpanded.toString());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!burgerButton.contains(e.target) && !mobileMenu.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                if (burgerIcon && closeIcon) {
                    burgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
                burgerButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                if (burgerIcon && closeIcon) {
                    burgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
                burgerButton.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button')
    const mobileMenu = document.getElementById('mobile-menu')

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden')
            
            // Toggle menu icon
            const isOpen = !mobileMenu.classList.contains('hidden')
            mobileMenuButton.innerHTML = isOpen 
                ? '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                : '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>'
        })

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden')
            }
        })

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden')
            })
        })
    }
}

// Enhanced navigation functionality
function initNavigation() {
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href')
            
            // Handle hash navigation
            if (href.startsWith('#')) {
                e.preventDefault()
                const targetId = href.substring(1)
                const targetElement = document.getElementById(targetId)
                
                if (targetElement) {
                    // Handle in-page navigation
                    const mobileMenu = document.getElementById('mobile-menu')
                    if (mobileMenu) {
                        mobileMenu.classList.add('hidden')
                    }

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    })

                    window.history.pushState(null, '', href)
                }
            } 
            // Handle page navigation
            else if (href.endsWith('.html')) {
                e.preventDefault()
                document.body.classList.add('page-exit-active')
                
                setTimeout(() => {
                    window.location.href = href
                }, 500)
            }
        })
    })

    // Handle initial hash on page load
    if (window.location.hash) {
        const targetElement = document.getElementById(window.location.hash.substring(1))
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
        }
    }

    // Add page enter animation
    document.body.classList.add('page-enter')
    requestAnimationFrame(() => {
        document.body.classList.add('page-enter-active')
    })
}

// Initialize booking forms
function initForms() {
    const bookingForms = document.querySelectorAll('.booking-form')
    bookingForms.forEach(form => {
        new BookingForm(form)
    })
}

// Initialize animations
const initAnimations = () => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animation = element.dataset.animate;
                const slide = element.dataset.slide;
                
                let animationClass = 'animate-fade-in';
                if (animation === 'slide') {
                    animationClass = `animate-slide-${slide || 'up'}`;
                } else if (animation === 'scale') {
                    animationClass = 'animate-scale-in';
                }
                
                element.classList.add(animationClass);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => observer.observe(element));
};

// Initialize hover effects
const initHoverEffects = () => {
    const hoverElements = document.querySelectorAll('[data-hover]');
    
    hoverElements.forEach(element => {
        const effect = element.dataset.hover;
        
        element.addEventListener('mouseenter', () => {
            element.classList.add(`hover-${effect}`);
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.add(`hover-${effect}-out`);
            setTimeout(() => {
                element.classList.remove(`hover-${effect}`);
                element.classList.remove(`hover-${effect}-out`);
            }, 300);
        });
    });
};

// Initialize gallery
function initGallery() {
    if (typeof window.openGallery === 'function') {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imageSrc = item.querySelector('img').src;
                window.openGallery(imageSrc);
            });
        });
    }
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Booking Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;

    const steps = Array.from(document.querySelectorAll('.booking-step'));
    const prevButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    const submitButton = document.getElementById('submit-booking');
    const stepIndicators = Array.from(document.querySelectorAll('.booking-step-indicator'));
    let currentStep = 1;

    // Service Selection
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from other cards
            serviceCards.forEach(c => c.classList.remove('border-primary-mediumBrown', 'bg-primary-lightBrown/5'));
            // Add selection to clicked card
            card.classList.add('border-primary-mediumBrown', 'bg-primary-lightBrown/5');
        });
    });

    // Time Slot Selection
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('bg-primary-lightBrown/10', 'border-primary-mediumBrown'));
            slot.classList.add('bg-primary-lightBrown/10', 'border-primary-mediumBrown');
        });
    });

    // Date Input Configuration
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        dateInput.min = today.toISOString().split('T')[0];
    }

    // Phone Number Formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) value = value.slice(0, 9);
            const parts = [];
            for (let i = 0; i < value.length; i += 2) {
                parts.push(value.slice(i, Math.min(i + 2, value.length)));
            }
            e.target.value = parts.join(' ');
        });
    }

    // Navigation Functions
    function updateStepIndicator(currentStep) {
        const stepIndicators = document.querySelectorAll('.booking-step-indicator');
        const stepText = document.querySelector('[data-translate^="step_"]');
        const currentLang = localStorage.getItem('preferred-language') || 'uk';

        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            if (index + 1 === currentStep) {
                indicator.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                indicator.classList.add('bg-primary-mediumBrown', 'text-white');
            } else if (index + 1 < currentStep) {
                indicator.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
                indicator.classList.add('bg-primary-lightBrown', 'text-white');
            } else {
                indicator.classList.remove('bg-primary-mediumBrown', 'bg-primary-lightBrown', 'text-white');
                indicator.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-400');
            }
        });

        // Update step text with translation
        if (stepText) {
            stepText.dataset.translate = `step_${currentStep}`;
            stepText.textContent = translations[currentLang][`step_${currentStep}`];
        }
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            if (index === stepIndex - 1) {
                step.classList.remove('hidden');
                step.classList.add('active');
            } else {
                step.classList.add('hidden');
                step.classList.remove('active');
            }
        });

        // Update navigation buttons
        prevButton.classList.toggle('hidden', stepIndex === 1);
        nextButton.classList.toggle('hidden', stepIndex === 3);
        submitButton.classList.toggle('hidden', stepIndex !== 3);

        // Update step indicators
        currentStep = stepIndex;
        updateStepIndicator(currentStep);
    }

    function validateStep(stepIndex) {
        switch(stepIndex) {
            case 1:
                const selectedService = document.querySelector('.service-card.border-primary-mediumBrown');
                return !!selectedService;
            case 2:
                const selectedDate = dateInput.value;
                const selectedTime = document.querySelector('.time-slot.border-primary-mediumBrown');
                return selectedDate && selectedTime;
            case 3:
                const name = document.getElementById('name').value;
                const phone = document.getElementById('phone').value;
                return name.length >= 2 && phone.length >= 9;
            default:
                return true;
        }
    }

    // Event Listeners
    prevButton.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    nextButton.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                currentStep++;
                showStep(currentStep);
            }
        } else {
            // Show validation message
            const messages = {
                1: 'Будь ласка, оберіть послугу',
                2: 'Будь ласка, оберіть дату та час',
                3: 'Будь ласка, заповніть всі обов\'язкові поля'
            };
            alert(messages[currentStep]);
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            // Here you would typically send the form data to your backend
            const formData = new FormData(bookingForm);
            alert('Дякуємо за запис! Ми зв\'яжемося з вами найближчим часом для підтвердження.');
            bookingForm.reset();
            currentStep = 1;
            showStep(currentStep);
        }
    });

    // Initialize
    showStep(currentStep);
});

// Date Input Enhancement
function initializeDateInput() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;

    // Set minimum date to today
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate()); // Allow booking from today
    dateInput.min = minDate.toISOString().split('T')[0];

    // Set maximum date to 3 months from now
    const maxDate = new Date(today);
    maxDate.setMonth(today.getMonth() + 3);
    dateInput.max = maxDate.toISOString().split('T')[0];

    // Format the date when user selects a date
    dateInput.addEventListener('change', (e) => {
        const date = new Date(e.target.value);
        if (date) {
            const formattedDate = date.toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            // Update the input's display value while keeping the actual value
            e.target.dataset.displayValue = formattedDate;
        }
    });

    // Disable weekends
    dateInput.addEventListener('input', (e) => {
        const date = new Date(e.target.value);
        if (date) {
            const day = date.getDay();
            if (day === 0 || day === 6) { // 0 is Sunday, 6 is Saturday
                alert('На жаль, ми не працюємо у вихідні. Будь ласка, оберіть інший день.');
                e.target.value = '';
            }
        }
    });
}

// Function to change language
function changeLanguage(lang) {
    // Update language preference
    localStorage.setItem('preferred-language', lang);
    
    // Translate the page
    translatePage(lang);
}

// Initialize language switcher
function initLanguageSwitcher() {
    const toggleButton = document.getElementById('language-toggle');
    const dropdown = document.getElementById('language-dropdown');
    const mobileToggleButton = document.getElementById('mobile-language-toggle');
    const mobileDropdown = document.getElementById('mobile-language-dropdown');
    const currentLangIcon = document.getElementById('current-lang-icon');
    const currentLangText = document.getElementById('current-lang-text');
    const mobileLangIcon = document.getElementById('mobile-current-lang-icon');
    const mobileLangText = document.getElementById('mobile-current-lang-text');

    function setupLanguageSwitcher(button, dropdown, isDesktop = true) {
        if (!button || !dropdown) return;

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            dropdown.classList.toggle('hidden');
            
            // Rotate arrow for mobile
            if (!isDesktop) {
                const arrow = button.querySelector('svg');
                if (arrow) {
                    arrow.style.transform = !isExpanded ? 'rotate(180deg)' : '';
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                button.setAttribute('aria-expanded', 'false');
                dropdown.classList.add('hidden');
                if (!isDesktop) {
                    const arrow = button.querySelector('svg');
                    if (arrow) {
                        arrow.style.transform = '';
                    }
                }
            }
        });

        // Handle language selection
        dropdown.querySelectorAll('[data-lang]').forEach(langButton => {
            langButton.addEventListener('click', () => {
                const lang = langButton.getAttribute('data-lang');
                const icon = langButton.querySelector('img').src;
                const text = langButton.querySelector('span').textContent;

                // Update both desktop and mobile
                if (currentLangIcon) currentLangIcon.src = icon;
                if (currentLangText) currentLangText.textContent = text;
                if (mobileLangIcon) mobileLangIcon.src = icon;
                if (mobileLangText) mobileLangText.textContent = text;

                // Hide dropdown
                dropdown.classList.add('hidden');
                button.setAttribute('aria-expanded', 'false');
                if (!isDesktop) {
                    const arrow = button.querySelector('svg');
                    if (arrow) {
                        arrow.style.transform = '';
                    }
                }

                // Change language
                changeLanguage(lang);
            });
        });
    }

    // Setup both desktop and mobile language switchers
    setupLanguageSwitcher(toggleButton, dropdown, true);
    setupLanguageSwitcher(mobileToggleButton, mobileDropdown, false);
}

// Function to translate the page
function translatePage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.dataset.translate;
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Make sure to update the current step text when language changes
    const currentStepText = document.querySelector('[data-translate^="step_"]');
    if (currentStepText) {
        const stepNumber = currentStepText.dataset.translate.split('_')[1];
        currentStepText.textContent = translations[lang][`step_${stepNumber}`];
    }
}

// Initialize language preference
function initLanguagePreference() {
    const preferredLang = localStorage.getItem('preferred-language') || 'uk';
    const langButton = document.querySelector(`button[data-lang="${preferredLang}"]`);
    if (langButton) {
        const flagImg = langButton.querySelector('img').src;
        const langText = langButton.querySelector('span').textContent;
        
        const currentLangIcon = document.getElementById('current-lang-icon');
        const currentLangText = document.getElementById('current-lang-text');
        
        currentLangIcon.src = flagImg;
        currentLangText.textContent = langText;
        
        translatePage(preferredLang);
    }
}

// Service card scrolling functionality
function setupServiceScrolling() {
    const serviceLinks = {
        'brows': 0,
        'lashes': 1,
        'makeup': 2
    };

    // Add click event listeners to footer service links
    document.querySelectorAll('.footer-section [data-translate]').forEach(link => {
        // Skip portfolio links
        if (link.closest('a')?.getAttribute('href') === '#portfolio') return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const service = link.getAttribute('data-translate');
            
            // First scroll to booking section
            document.querySelector('#booking').scrollIntoView({ behavior: 'smooth' });
            
            // Wait for vertical scroll to complete before horizontal scroll
            setTimeout(() => {
                const cardIndex = serviceLinks[service];
                const serviceCards = document.querySelector('#step-1 .flex');
                const targetCard = serviceCards.children[cardIndex];
                
                if (targetCard) {
                    const container = serviceCards.parentElement;
                    const scrollLeft = targetCard.offsetLeft - container.offsetLeft;
                    
                    container.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    });
                }
            }, 400);
        });
    });

    // Setup portfolio link scrolling
    document.querySelectorAll('a[href="#portfolio"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#portfolio').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Section scroll animation functionality
function initSectionScroll() {
    // Handle all links that point to sections (href starting with #)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Remove any existing animation classes
                targetElement.classList.remove('momentum-scroll-end');
                
                // Scroll to the target section
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // Add the bounce animation after scrolling
                setTimeout(() => {
                    targetElement.classList.add('momentum-scroll-end');
                    // Remove the animation class after it completes
                    setTimeout(() => {
                        targetElement.classList.remove('momentum-scroll-end');
                    }, 500);
                }, 1000); // Adjust timing based on scroll duration
            }
        });
    });

    // Handle service links specifically
    const serviceLinks = {
        'brows': 0,
        'lashes': 1,
        'makeup': 2
    };

    Object.keys(serviceLinks).forEach(service => {
        document.querySelectorAll(`a[data-translate="${service}"]`).forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const bookingSection = document.querySelector('#booking');
                
                if (bookingSection) {
                    // Remove any existing animation classes
                    bookingSection.classList.remove('momentum-scroll-end');
                    
                    // Scroll to booking section
                    bookingSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Add bounce animation after scrolling
                    setTimeout(() => {
                        bookingSection.classList.add('momentum-scroll-end');
                        
                        // Remove animation class after it completes
                        setTimeout(() => {
                            bookingSection.classList.remove('momentum-scroll-end');
                        }, 500);
                        
                        // Highlight the corresponding service card
                        const serviceCards = document.querySelectorAll('#step-1 .service-card');
                        const targetCard = serviceCards[serviceLinks[service]];
                        
                        if (targetCard) {
                            targetCard.classList.add('momentum-scroll-end-horizontal');
                            setTimeout(() => {
                                targetCard.classList.remove('momentum-scroll-end-horizontal');
                            }, 500);
                        }
                    }, 500);
                }
            });
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initBurgerMenu();
    initLanguageSwitcher();
    initLanguagePreference();
    animationController.init();
    setupServiceScrolling();
    initSectionScroll(); // Initialize section scroll animations
});
