// Image zoom functionality
class ImageZoom {
    constructor() {
        this.scale = 1;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.currentIndex = 0;
        this.galleryItems = [];
        this.setupGallery();
    }

    setupGallery() {
        this.galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                this.currentIndex = index;
                this.openZoomView(e);
            });
        });
    }

    createNavigationArrows(zoomContainer) {
        // Left arrow
        const leftArrow = document.createElement('div');
        leftArrow.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-white hover:text-gray-300 transition-colors';
        leftArrow.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>`;
        leftArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateGallery('prev');
        });

        // Right arrow
        const rightArrow = document.createElement('div');
        rightArrow.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-white hover:text-gray-300 transition-colors';
        rightArrow.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>`;
        rightArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateGallery('next');
        });

        // Info arrow (bottom)
        const infoArrow = document.createElement('div');
        infoArrow.className = 'absolute bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer text-white hover:text-gray-300 transition-all duration-300';
        infoArrow.innerHTML = `<svg class="w-10 h-10 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>`;
        infoArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleInfoPanel(infoArrow);
        });

        // Close button (top-right)
        const closeButton = document.createElement('div');
        closeButton.className = 'absolute top-4 right-4 cursor-pointer text-white hover:text-gray-300 transition-colors';
        closeButton.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`;
        closeButton.addEventListener('click', () => {
            this.resetZoom();
            zoomContainer.remove();
        });

        return { leftArrow, rightArrow, infoArrow, closeButton };
    }

    createInfoPanel() {
        const currentItem = this.galleryItems[this.currentIndex];
        const title = currentItem.querySelector('h3').textContent;
        const description = currentItem.querySelector('p').textContent;

        const infoPanel = document.createElement('div');
        infoPanel.className = 'absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-6 transform translate-y-full transition-transform duration-300 z-[60]';
        infoPanel.innerHTML = `
            <h3 class="text-xl font-semibold mb-2">${title}</h3>
            <p class="text-gray-200">${description}</p>
        `;
        infoPanel.style.display = 'none';
        return infoPanel;
    }

    toggleInfoPanel(infoArrow) {
        const infoPanel = document.querySelector('.zoom-info-panel');
        if (!infoPanel) return;

        const isHidden = infoPanel.style.display === 'none';
        const arrow = infoArrow.querySelector('svg');

        if (isHidden) {
            // Show panel
            infoPanel.style.display = 'block';
            setTimeout(() => {
                infoPanel.style.transform = 'translateY(0)';
                // Move arrow up and rotate it
                infoArrow.style.transform = 'translate(-50%, -100%) translateY(-2rem)';
                arrow.style.transform = 'rotate(180deg)';
            }, 10);
        } else {
            // Hide panel
            infoPanel.style.transform = 'translateY(100%)';
            // Move arrow back down and rotate it back
            infoArrow.style.transform = 'translate(-50%, 0)';
            arrow.style.transform = 'rotate(0)';
            setTimeout(() => {
                infoPanel.style.display = 'none';
            }, 300);
        }
    }

    navigateGallery(direction) {
        const currentZoomedImg = document.querySelector('.zoom-view');
        if (!currentZoomedImg) return;

        // Calculate new index
        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.galleryItems.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
        }
        
        const newImg = this.galleryItems[this.currentIndex].querySelector('img');
        
        // Create new image element
        const nextImage = document.createElement('img');
        nextImage.src = newImg.src;
        nextImage.className = 'max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-200 zoom-view z-[40]';
        nextImage.style.opacity = '0';
        nextImage.style.transition = 'opacity 0.3s ease-in-out';
        nextImage.style.position = 'absolute';
        nextImage.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
        
        // Add the new image to container
        const imageContainer = document.querySelector('.image-container');
        if (imageContainer) {
            imageContainer.appendChild(nextImage);
            
            // Add event listeners to the new image
            this.attachImageEventListeners(nextImage, imageContainer);
            
            // Trigger reflow
            nextImage.offsetHeight;
            
            // Fade in new image
            nextImage.style.opacity = '1';
            
            // Fade out old image
            currentZoomedImg.style.transition = 'opacity 0.3s ease-in-out';
            currentZoomedImg.style.opacity = '0';
            
            // Remove old image after transition
            setTimeout(() => {
                currentZoomedImg.remove();
                
                // Update info panel content
                const infoPanel = document.querySelector('.zoom-info-panel');
                if (infoPanel) {
                    const currentItem = this.galleryItems[this.currentIndex];
                    const title = currentItem.querySelector('h3').textContent;
                    const description = currentItem.querySelector('p').textContent;
                    infoPanel.innerHTML = `
                        <h3 class="text-xl font-semibold mb-2">${title}</h3>
                        <p class="text-gray-200">${description}</p>
                    `;
                }
            }, 300);
        }
    }

    attachImageEventListeners(zoomedImg, container) {
        // Wheel event for zooming
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY * -0.01;
            this.scale = Math.min(Math.max(1, this.scale + delta), 5);
            zoomedImg.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
        });
        
        // Mouse events for dragging
        container.addEventListener('mousedown', (e) => {
            if (e.button === 0 && (e.target === zoomedImg || e.target.classList.contains('zoom-view'))) {
                this.isDragging = true;
                this.startX = e.clientX - this.translateX;
                this.startY = e.clientY - this.translateY;
            }
        });
        
        container.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.translateX = e.clientX - this.startX;
                this.translateY = e.clientY - this.startY;
                const currentImg = container.querySelector('.zoom-view');
                if (currentImg) {
                    currentImg.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
                }
            }
        });
        
        container.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        container.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });
    }

    openZoomView(event) {
        const img = event.currentTarget.querySelector('img');
        
        // Create zoom container
        const zoomContainer = document.createElement('div');
        zoomContainer.className = 'fixed inset-0 z-50 bg-black bg-opacity-90';
        
        // Create image container for proper positioning
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container relative flex items-center justify-center w-full h-full z-[40]';
        
        // Create navigation container
        const navigationContainer = document.createElement('div');
        navigationContainer.className = 'absolute inset-0 pointer-events-none z-[45]';
        
        // Create zoomed image
        const zoomedImg = document.createElement('img');
        zoomedImg.src = img.src;
        zoomedImg.className = 'max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-200 zoom-view';
        zoomedImg.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
        zoomedImg.style.opacity = '0';
        zoomedImg.style.transition = 'opacity 0.3s ease-in-out';
        
        // Add navigation arrows and info panel
        const { leftArrow, rightArrow, infoArrow, closeButton } = this.createNavigationArrows(zoomContainer);
        const infoPanel = this.createInfoPanel();
        infoPanel.className += ' zoom-info-panel';
        
        // Update navigation elements to have pointer-events-auto
        [leftArrow, rightArrow, infoArrow, closeButton].forEach(el => {
            el.style.pointerEvents = 'auto';
        });
        
        // Append elements in the correct order
        imageContainer.appendChild(zoomedImg);
        navigationContainer.appendChild(leftArrow);
        navigationContainer.appendChild(rightArrow);
        navigationContainer.appendChild(infoArrow);
        navigationContainer.appendChild(closeButton);
        navigationContainer.appendChild(infoPanel);
        
        zoomContainer.appendChild(imageContainer);
        zoomContainer.appendChild(navigationContainer);
        document.body.appendChild(zoomContainer);

        // Attach event listeners
        this.attachImageEventListeners(zoomedImg, imageContainer);
        
        // Trigger reflow
        zoomedImg.offsetHeight;
        
        // Fade in image
        zoomedImg.style.opacity = '1';
    }
    
    resetZoom() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
    }
}

// Initialize the image zoom functionality
document.addEventListener('DOMContentLoaded', () => {
    new ImageZoom();
});