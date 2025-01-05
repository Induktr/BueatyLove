export class SiteSearch {
    constructor() {
        this.searchInput = document.getElementById('site-search');
        this.searchResults = document.getElementById('search-results');
        this.searchOverlay = document.getElementById('search-overlay');
        this.searchButton = document.getElementById('search-button');
        this.sections = this.getAllSections();
        this.init();
    }

    init() {
        // Initialize search button
        this.searchButton?.addEventListener('click', () => {
            this.showOverlay();
            this.searchInput?.focus();
        });

        // Initialize search input listeners
        this.searchInput?.addEventListener('input', () => this.handleSearch());
        
        // Close search on overlay click
        this.searchOverlay?.addEventListener('click', (e) => {
            if (e.target === this.searchOverlay) {
                this.hideOverlay();
            }
        });

        // Close search on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideOverlay();
            }
        });
    }

    getAllSections() {
        const sections = [];
        // Get all sections with headings
        document.querySelectorAll('section').forEach(section => {
            const heading = section.querySelector('h1, h2, h3');
            if (heading) {
                sections.push({
                    id: section.id || '',
                    title: heading.textContent.trim(),
                    content: section.textContent.trim(),
                });
            }
        });
        return sections;
    }

    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        if (!query) {
            this.hideResults();
            return;
        }

        const results = this.sections.filter(section => {
            return section.title.toLowerCase().includes(query) ||
                   section.content.toLowerCase().includes(query);
        });

        this.displayResults(results);
    }

    displayResults(results) {
        if (!results.length) {
            this.searchResults.innerHTML = `
                <div class="p-4 text-text-muted dark:text-text-onDark">
                    Нічого не знайдено
                </div>
            `;
            return;
        }

        this.searchResults.innerHTML = results.map(result => `
            <a href="#${result.id}" 
               class="block p-4 hover:bg-background-cream dark:hover:bg-darkGray transition-colors"
               onclick="this.closest('.search-container').querySelector('#site-search').blur()">
                <h4 class="font-medium text-primary-darkBrown dark:text-primary-lightBrown">
                    ${result.title}
                </h4>
                <p class="text-sm text-text-muted dark:text-text-onDark mt-1">
                    ${this.truncateText(result.content, 100)}
                </p>
            </a>
        `).join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    showOverlay() {
        this.searchOverlay.classList.remove('hidden');
        this.searchResults.classList.remove('hidden');
        setTimeout(() => {
            this.searchOverlay.classList.add('opacity-100');
        }, 10);
    }

    hideOverlay() {
        this.searchOverlay.classList.remove('opacity-100');
        setTimeout(() => {
            this.searchOverlay.classList.add('hidden');
            this.searchResults.classList.add('hidden');
            this.searchInput.blur();
        }, 300);
    }

    hideResults() {
        this.searchResults.innerHTML = '';
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SiteSearch();
});
