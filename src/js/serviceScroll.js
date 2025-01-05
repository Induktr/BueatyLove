// Handle service link clicks and scrolling
document.addEventListener('DOMContentLoaded', () => {
    const serviceLinks = document.querySelectorAll('[data-scroll-to-service]');

    serviceLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceType = link.getAttribute('data-scroll-to-service');
            
            // First scroll to booking section
            const bookingSection = document.querySelector('#booking');
            bookingSection.scrollIntoView({ behavior: 'smooth' });

            // Wait for vertical scroll to complete
            setTimeout(() => {
                const serviceCard = document.querySelector(`[data-service="${serviceType}"]`);
                if (serviceCard) {
                    // Get the scrollable container
                    const scrollContainer = serviceCard.closest('.overflow-x-auto');
                    if (scrollContainer) {
                        // Calculate scroll position
                        const scrollLeft = serviceCard.offsetLeft - (scrollContainer.offsetWidth - serviceCard.offsetWidth) / 2;
                        
                        // Smooth scroll to the service card
                        scrollContainer.scrollTo({
                            left: scrollLeft,
                            behavior: 'smooth'
                        });
                    }
                }
            }, 1000); // Wait for 1 second after vertical scroll
        });
    });
});
