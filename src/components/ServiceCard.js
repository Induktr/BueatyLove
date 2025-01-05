export class ServiceCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['icon', 'title', 'description'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    render() {
        const icon = this.getAttribute('icon') || 'default';
        const title = this.getAttribute('title') || '';
        const description = this.getAttribute('description') || '';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .service-card {
                    background: var(--background-light, #FFFFFF);
                    padding: 2rem;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                :host([theme="dark"]) .service-card {
                    background: var(--background-dark, #1A1A1A);
                }
                
                .service-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
                }
                
                .icon {
                    width: 3rem;
                    height: 3rem;
                    margin-bottom: 1rem;
                    color: var(--primary-mediumBrown, #A67C52);
                }
                
                .title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: var(--text-onLight, #1A1A1A);
                }
                
                :host([theme="dark"]) .title {
                    color: var(--text-onDark, #FFFFFF);
                }
                
                .description {
                    color: var(--text-muted, #6B7280);
                    line-height: 1.5;
                }
                
                :host([theme="dark"]) .description {
                    color: var(--text-onDark, #FFFFFF);
                    opacity: 0.7;
                }
            </style>
            
            <div class="service-card">
                <div class="icon" data-icon="${icon}"></div>
                <h3 class="title">${title}</h3>
                <p class="description">${description}</p>
            </div>
        `;
    }
}

customElements.define('service-card', ServiceCard);
