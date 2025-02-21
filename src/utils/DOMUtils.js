/**
 * DOM manipulation and utility functions
 */
import { DOM_IDS } from '../config.js';

/**
 * Cache of DOM elements
 * @type {Object.<string, HTMLElement>}
 */
const elementCache = {};

export const DOMUtils = {
    /**
     * Get DOM element by ID with caching
     * @param {string} id - Element ID
     * @returns {HTMLElement} DOM element
     */
    getElement(id) {
        if (!elementCache[id]) {
            elementCache[id] = document.getElementById(id);
            if (!elementCache[id]) {
                throw new Error(`Element with id '${id}' not found`);
            }
        }
        return elementCache[id];
    },

    /**
     * Get all main DOM elements used by the application
     * @returns {Object.<string, HTMLElement>} Object containing DOM elements
     */
    getAllElements() {
        const elements = {};
        Object.entries(DOM_IDS).forEach(([key, id]) => {
            elements[key] = this.getElement(id);
        });
        return elements;
    },

    /**
     * Create element from HTML string
     * @param {string} html - HTML string
     * @returns {HTMLElement} Created element
     */
    createFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    },

    /**
     * Add fade out animation to element
     * @param {HTMLElement} element - Element to animate
     * @returns {Promise<void>} Resolves when animation completes
     */
    fadeOut(element) {
        return new Promise(resolve => {
            element.classList.add('fade-out');
            element.addEventListener('animationend', () => {
                resolve();
            }, { once: true });
        });
    },

    /**
     * Apply shake animation to element
     * @param {HTMLElement} element - Element to animate
     */
    shake(element) {
        element.classList.add('shaking');
        element.addEventListener('animationend', () => {
            element.classList.remove('shaking');
        }, { once: true });
    },

    /**
     * Show confirmation dialog
     * @param {Object} options - Dialog options
     * @param {string} options.message - Main message
     * @param {string} [options.subtext] - Optional subtext
     * @param {string} [options.confirmText='Yes, Delete'] - Confirm button text
     * @param {string} [options.cancelText='Cancel'] - Cancel button text
     * @returns {Promise<boolean>} Resolves with user's choice
     */
    showConfirmation({ message, subtext, confirmText = 'Yes, Delete', cancelText = 'Cancel' }) {
        return new Promise(resolve => {
            const template = document.getElementById('confirmation-template');
            if (!template) {
                console.error('Confirmation template not found, falling back to native confirm');
                return resolve(confirm(message));
            }

            const dialog = template.content.cloneNode(true);
            
            // Set content
            dialog.querySelector('.confirmation-header p').textContent = message;
            const subtextEl = dialog.querySelector('.confirmation-header .subtext');
            if (subtext) {
                subtextEl.textContent = subtext;
                subtextEl.style.display = 'block';
            } else {
                subtextEl.style.display = 'none';
            }

            // Set button text
            dialog.querySelector('.confirm-btn').textContent = confirmText;
            dialog.querySelector('.cancel-btn').textContent = cancelText;
            
            document.body.appendChild(dialog);
            
            const confirmationEl = document.querySelector('.confirmation-dialog');
            
            // Animation setup
            confirmationEl.style.opacity = '0';
            const content = confirmationEl.querySelector('.confirmation-content');
            content.style.transform = 'scale(0.95) translateY(10px)';
            
            // Animate in
            requestAnimationFrame(() => {
                confirmationEl.style.opacity = '1';
                content.style.transform = 'scale(1) translateY(0)';
            });

            // Handle backdrop click
            confirmationEl.addEventListener('click', (e) => {
                if (e.target === confirmationEl) {
                    handleChoice(false);
                }
            });
            
            // Handle user choice
            const handleChoice = (confirmed) => {
                // Animate out
                confirmationEl.style.opacity = '0';
                content.style.transform = 'scale(0.95) translateY(10px)';
                
                setTimeout(() => {
                    confirmationEl.remove();
                    resolve(confirmed);
                }, 200);
            };
            
            confirmationEl.querySelector('.confirm-btn')
                .addEventListener('click', () => handleChoice(true));
            
            confirmationEl.querySelector('.cancel-btn')
                .addEventListener('click', () => handleChoice(false));

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleChoice(false);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    },

    /**
     * Show error message
     * @param {string} message - Error message
     * @param {number} [duration=5000] - Duration in ms to show error
     */
    showError(message, duration = 5000) {
        const errorEl = this.createFromHTML(`
            <div class="error-message">
                <div class="error-content">
                    <p>${message}</p>
                    <button class="close-btn">&times;</button>
                </div>
            </div>
        `);

        // Add to DOM
        document.body.appendChild(errorEl);

        // Setup close button
        const closeBtn = errorEl.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => errorEl.remove());

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (errorEl.isConnected) {
                    errorEl.remove();
                }
            }, duration);
        }
    }
};