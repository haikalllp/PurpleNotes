/**
 * Manages notifications and reminders for the application
 */
import AudioService from './AudioService.js';

class NotificationService {
    constructor() {
        this.activeNotifications = new Set();
    }

    /**
     * Show a notification for a note
     * @param {Object} note - Note object to show notification for
     * @returns {Promise<void>}
     */
    async showNotification(note) {
        // Mark note as notified immediately to prevent duplicate notifications
        note.markNotified();
        
        const notification = this.createNotificationElement(note);
        document.body.appendChild(notification);

        // Initial animation state
        notification.style.opacity = '0';
        const notificationCard = notification.querySelector('.notification-card');
        notificationCard.style.transform = 'translateY(20px) scale(0.95)';

        // Start notification sound and shaking
        try {
            await AudioService.playEffect('notification');
            this.startShaking(notificationCard);
        } catch (error) {
            console.error('Notification playback error:', error);
        }

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notificationCard.style.transform = 'translateY(0) scale(1)';
        });

        // Track active notification
        this.activeNotifications.add(notification);

        // Set up dismiss handler
        this.setupDismissHandler(notification);
    }

    /**
     * Create the notification DOM element
     * @private
     * @param {Object} note - Note object to create notification for
     * @returns {HTMLElement} Notification element
     */
    createNotificationElement(note) {
        const notification = document.createElement('div');
        notification.className = 'notification-overlay';
        notification.innerHTML = `
            <div class="notification-card" data-note-id="${note.id}">
                <div class="notification-header">
                    <h3 class="notification-title">${note.title}</h3>
                    <div class="notification-time">
                        ${new Date(note.reminder).toLocaleString()}
                    </div>
                </div>
                <div class="notification-body">
                    <p>${note.content}</p>
                </div>
                <div class="notification-footer">
                    <button class="notification-continue primary-btn">Dismiss</button>
                </div>
            </div>
        `;
        return notification;
    }

    /**
     * Start shaking animation for notification
     * @private
     * @param {HTMLElement} notificationCard - Card element to animate
     */
    startShaking(notificationCard) {
        // Initial shake
        notificationCard.classList.add('shaking');
        
        // Set up interval for repeated shaking
        const shakeInterval = setInterval(() => {
            if (!notificationCard.isConnected) {
                clearInterval(shakeInterval);
                return;
            }
            // Force reflow to ensure smooth animation restart
            void notificationCard.offsetWidth;
            notificationCard.classList.remove('shaking');
            void notificationCard.offsetWidth;
            notificationCard.classList.add('shaking');
        }, 400); // Shake every 400ms to match animation duration

        // Store interval for cleanup
        notificationCard.dataset.shakeInterval = shakeInterval;
    }

    /**
     * Set up dismiss handler for notification
     * @private
     * @param {HTMLElement} notification - Notification element to handle
     */
    setupDismissHandler(notification) {
        const notificationCard = notification.querySelector('.notification-card');
        const noteId = notificationCard.dataset.noteId;

        const handleDismiss = () => {
            // Clear shaking animation
            clearInterval(notificationCard.dataset.shakeInterval);
            
            // Stop notification sound
            AudioService.stopEffect('notification');
            
            // Play dismiss sound
            AudioService.playEffect('reminderDismiss');
            
            // Remove notification and clear from active set
            notification.remove();
            this.activeNotifications.delete(notification);

            // Find and update the note in storage to ensure persistence
            const notes = Note.getAll();
            const note = notes.find(n => n.id === parseInt(noteId));
            if (note) {
                note.markNotified();
                Note.save(notes);
            }
        };

        notification.querySelector('.notification-continue').addEventListener('click', handleDismiss);
    }

    /**
     * Dismiss all active notifications
     */
    dismissAll() {
        this.activeNotifications.forEach(notification => {
            const dismissButton = notification.querySelector('.notification-continue');
            if (dismissButton) {
                dismissButton.click();
            }
        });
    }

    /**
     * Check if a note needs notification
     * @param {Object} note - Note to check
     * @returns {boolean} True if note should be notified
     */
    shouldNotify(note) {
        // If note is already marked as notified, never show notification
        if (note.notified) {
            return false;
        }

        // Check if reminder exists and is due
        if (!note.reminder || note.reminder > Date.now()) {
            return false;
        }

        // Check if a notification is already active for this note
        const hasActiveNotification = Array.from(this.activeNotifications).some(n =>
            n.querySelector('.notification-card')?.dataset.noteId === String(note.id)
        );

        return !hasActiveNotification;
    }
}

// Export singleton instance
export default new NotificationService();