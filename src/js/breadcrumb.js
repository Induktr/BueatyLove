// Page titles mapping
const pageTitles = {
    '/': 'Головна',
    '/src/pages/prices.html': 'Наші ціни',
    '/src/pages/about.html': 'Про нас',
    '/src/pages/portfolio.html': 'Портфоліо',
    '/src/pages/contacts.html': 'Контакти'
};

class BreadcrumbNavigator {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeElements());
        } else {
            this.initializeElements();
        }
    }

    initializeElements() {
        this.breadcrumb = document.getElementById('breadcrumb');
        this.separator = document.getElementById('breadcrumb-separator');
        this.currentPage = document.getElementById('current-page');

        if (!this.breadcrumb || !this.separator || !this.currentPage) {
            console.warn('Breadcrumb elements not found');
            return;
        }

        this.updateBreadcrumb();
        this.setupEventListeners();
    }

    updateBreadcrumb() {
        const path = window.location.pathname;
        const title = pageTitles[path] || this.getDefaultTitle(path);

        if (path === '/') {
            this.separator.classList.add('hidden');
            this.currentPage.classList.add('hidden');
        } else {
            this.separator.classList.remove('hidden');
            this.currentPage.classList.remove('hidden');
            this.currentPage.textContent = title;
        }
    }

    getDefaultTitle(path) {
        // Extract page name from path
        const pageName = path.split('/').pop().replace('.html', '');
        return pageName.charAt(0).toUpperCase() + pageName.slice(1);
    }

    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => this.updateBreadcrumb());

        // Handle home link click
        const homeLink = this.breadcrumb.querySelector('a[href="/"]');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/';
            });
        }
    }
}

// Initialize breadcrumb navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BreadcrumbNavigator();
});

// Handle navigation events for single-page application
const originalPushState = history.pushState;
history.pushState = function() {
    originalPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
};

const originalReplaceState = history.replaceState;
history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
};
