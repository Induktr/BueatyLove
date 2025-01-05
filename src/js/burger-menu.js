export class BurgerMenu {
    constructor() {
        this.button = document.getElementById('burger-menu-button');
        this.menu = document.getElementById('dropdown-menu');
        this.burgerIcon = this.button?.querySelector('.burger-icon');
        this.closeIcon = this.button?.querySelector('.close-icon');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.button || !this.menu) return;

        this.button.addEventListener('click', () => this.toggleMenu());
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.menu.style.transform = this.isOpen ? 'translateY(0)' : 'translateY(-100%)';
        this.burgerIcon?.classList.toggle('hidden', this.isOpen);
        this.closeIcon?.classList.toggle('hidden', !this.isOpen);
        
        // Add backdrop blur when menu is open
        if (this.isOpen) {
            document.body.style.overflow = 'hidden';
            this.menu.classList.add('backdrop-blur-sm');
        } else {
            document.body.style.overflow = '';
            this.menu.classList.remove('backdrop-blur-sm');
        }
    }

    handleClickOutside(event) {
        if (this.isOpen && !this.menu.contains(event.target) && !this.button.contains(event.target)) {
            this.toggleMenu();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.toggleMenu();
        }
    }
}
