// Import Intersection Observer utility
import { createObserver } from './utils/observer.js'

// Animation class for managing complex animations
class AnimationController {
    constructor() {
        this.parallaxElements = []
        this.scrollAnimations = new Map()
        this.initializeObservers()
    }

    initializeObservers() {
        // Fade-in observer
        this.fadeObserver = createObserver({
            threshold: 0.1,
            callback: (entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in')
                    this.fadeObserver.unobserve(entry.target)
                }
            }
        })

        // Slide-in observer
        this.slideObserver = createObserver({
            threshold: 0.1,
            callback: (entry) => {
                if (entry.isIntersecting) {
                    const direction = entry.target.dataset.slide || 'left'
                    entry.target.classList.add(`animate-slide-in-${direction}`)
                    this.slideObserver.unobserve(entry.target)
                }
            }
        })

        // Scale observer
        this.scaleObserver = createObserver({
            threshold: 0.1,
            callback: (entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-scale-in')
                    this.scaleObserver.unobserve(entry.target)
                }
            }
        })
    }

    // Initialize parallax effects
    initParallax() {
        this.parallaxElements = document.querySelectorAll('[data-parallax]')
        
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                this.parallaxElements.forEach(element => {
                    const speed = element.dataset.parallaxSpeed || 0.5
                    const rect = element.getBoundingClientRect()
                    const scrolled = window.pageYOffset
                    
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const yPos = -(scrolled * speed)
                        element.style.transform = `translate3d(0, ${yPos}px, 0)`
                    }
                })
            })
        })
    }

    // Initialize scroll-triggered animations
    initScrollAnimations() {
        // Fade-in animations
        document.querySelectorAll('[data-animate="fade"]').forEach(element => {
            this.fadeObserver.observe(element)
        })

        // Slide-in animations
        document.querySelectorAll('[data-animate="slide"]').forEach(element => {
            this.slideObserver.observe(element)
        })

        // Scale animations
        document.querySelectorAll('[data-animate="scale"]').forEach(element => {
            this.scaleObserver.observe(element)
        })
    }

    // Initialize hover effects
    initHoverEffects() {
        document.querySelectorAll('[data-hover]').forEach(element => {
            element.addEventListener('mouseenter', () => {
                const effect = element.dataset.hover
                element.classList.add(`hover-${effect}`)
            })

            element.addEventListener('mouseleave', () => {
                const effect = element.dataset.hover
                element.classList.remove(`hover-${effect}`)
            })
        })
    }

    // Initialize custom cursor
    initCustomCursor() {
        const cursor = document.createElement('div')
        cursor.className = 'custom-cursor'
        document.body.appendChild(cursor)

        const cursorDot = document.createElement('div')
        cursorDot.className = 'cursor-dot'
        document.body.appendChild(cursorDot)

        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
                cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
            })
        })

        // Add hover effect for interactive elements
        document.querySelectorAll('a, button, [data-cursor-hover]').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-hover')
                cursorDot.classList.add('dot-hover')
            })

            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-hover')
                cursorDot.classList.remove('dot-hover')
            })
        })
    }

    // Initialize all animations
    init() {
        this.initParallax()
        this.initScrollAnimations()
        this.initHoverEffects()
        this.initCustomCursor()
    }
}

export const animationController = new AnimationController()
