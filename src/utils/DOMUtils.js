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
            
            const confirmationElement = document.querySelector('.confirmation-dialog');
            
            // Animation setup
            confirmationElement.style.opacity = '0';
            const content = confirmationElement.querySelector('.confirmation-content');
            content.style.transform = 'scale(0.95) translateY(10px)';
            
            // Animate in
            requestAnimationFrame(() => {
                confirmationElement.style.opacity = '1';
                content.style.transform = 'scale(1) translateY(0)';
            });
            
            // Handle user choice
            const handleChoice = (confirmed) => {
                // Animate out
                confirmationElement.style.opacity = '0';
                content.style.transform = 'scale(0.95) translateY(10px)';
                
                setTimeout(() => {
                    confirmationElement.remove();
                    resolve(confirmed);
                }, 200);
            };
            
            confirmationElement.querySelector('.confirm-btn')
                .addEventListener('click', () => handleChoice(true));
            
            confirmationElement.querySelector('.cancel-btn')
                .addEventListener('click', () => handleChoice(false));
        });
    }
};