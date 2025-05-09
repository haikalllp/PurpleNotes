/**
 * Manages drag and drop functionality for task items
 */
export class DragManager {
    constructor() {
        this.draggedElement = null;
        this.ghostElement = null;
        this.initialY = 0;
        this.initialMouseY = 0;
        this.currentDropTarget = null;
        this.dropPosition = null;
        this.longPressTimeout = null;
        this.dragStarted = false;
        this.pressStartTime = 0;
        this.PRESS_DELAY = 200; // ms before drag starts
        this.scrollInterval = null;
        this.SCROLL_SPEED = 15; // pixels per frame
        this.SCROLL_ZONE = 50; // pixels from edge to trigger scroll
        this.lastTouchY = 0; // For touch momentum
        this.touchVelocity = 0;
        this.lastTouchTime = 0;
    }

    init(container) {
        this.container = container;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Touch events with improved handling
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Keyboard navigation
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Accessibility
        this.setupAccessibility();
    }

    handleMouseDown(e) {
        if (!e.target.closest('.task-item')) return;
        
        const taskItem = e.target.closest('.task-item');
        this.pressStartTime = Date.now();
        this.setupDragStart(taskItem, e.clientY);

        // Create ripple effect
        this.createRippleEffect(taskItem, e.clientX, e.clientY);
    }

    handleTouchStart(e) {
        if (!e.target.closest('.task-item')) return;
        e.preventDefault();

        const touch = e.touches[0];
        const taskItem = e.target.closest('.task-item');
        this.pressStartTime = Date.now();
        this.setupDragStart(taskItem, touch.clientY);

        // Create ripple effect
        this.createRippleEffect(taskItem, touch.clientX, touch.clientY);
    }

    setupDragStart(element, clientY) {
        element.classList.add('being-pressed');
        
        this.longPressTimeout = setTimeout(() => {
            const pressDuration = Date.now() - this.pressStartTime;
            if (pressDuration >= this.PRESS_DELAY) {
                element.classList.add('ready-to-drag');
                this.initiateDrag(element, clientY);
            }
        }, this.PRESS_DELAY);
    }

    createRippleEffect(element, clientX, clientY) {
        const ripple = document.createElement('div');
        ripple.className = 'drag-ripple';
        const rect = element.getBoundingClientRect();
        ripple.style.left = `${clientX - rect.left}px`;
        ripple.style.top = `${clientY - rect.top}px`;
        element.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    }

    initiateDrag(element, clientY) {
        this.draggedElement = element;
        this.initialY = element.offsetTop;
        this.initialMouseY = clientY;

        // Create ghost element
        this.ghostElement = element.cloneNode(true);
        this.ghostElement.classList.add('ghost');
        this.ghostElement.style.position = 'absolute';
        this.ghostElement.style.width = `${element.offsetWidth}px`;
        this.ghostElement.style.top = `${this.initialY}px`;
        this.container.appendChild(this.ghostElement);

        // Add dragging class to original element
        element.classList.add('dragging');
        this.dragStarted = true;
    }

    handleMouseMove(e) {
        if (!this.dragStarted) return;
        this.updateDragPosition(e.clientY);
    }

    handleTouchMove(e) {
        if (!this.dragStarted) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const currentTime = Date.now();
        const timeDelta = currentTime - this.lastTouchTime;
        
        // Calculate touch velocity for momentum
        if (timeDelta > 0) {
            this.touchVelocity = (touch.clientY - this.lastTouchY) / timeDelta;
        }
        
        this.lastTouchY = touch.clientY;
        this.lastTouchTime = currentTime;
        
        this.updateDragPosition(touch.clientY);
    }

    updateDragPosition(clientY) {
        const deltaY = clientY - this.initialMouseY;
        const newY = this.initialY + deltaY;

        // Update ghost element position with smooth animation
        this.ghostElement.style.transform = `translateY(${deltaY}px)`;
        this.ghostElement.style.top = `${this.initialY}px`;

        // Handle auto-scrolling
        this.handleAutoScroll(clientY);

        // Find potential drop target
        this.updateDropTarget(clientY);

        // Update ARIA live region
        this.updateAccessibilityStatus();
    }

    updateDropTarget(clientY) {
        const taskItems = Array.from(this.container.children);
        
        // Filter out the dragged and ghost elements
        const availableItems = taskItems.filter(item => 
            item !== this.draggedElement && item !== this.ghostElement
        );

        if (availableItems.length === 0) return;

        // Clear previous drop target
        if (this.currentDropTarget) {
            this.currentDropTarget.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
        }

        // Find the closest item based on fixed drop zones
        let targetItem = null;
        let position = null;

        for (let i = 0; i < availableItems.length; i++) {
            const item = availableItems[i];
            const rect = item.getBoundingClientRect();
            const dropZoneHeight = rect.height / 3; // Create three zones: top, middle, bottom

            if (clientY < rect.top + dropZoneHeight) {
                // Cursor is in the top zone
                targetItem = item;
                position = 'above';
                break;
            } else if (clientY >= rect.bottom - dropZoneHeight) {
                // Cursor is in the bottom zone
                if (i === availableItems.length - 1) {
                    targetItem = item;
                    position = 'below';
                    break;
                }
            } else if (clientY >= rect.top && clientY < rect.bottom) {
                // Cursor is in the middle zone
                targetItem = item;
                position = clientY < rect.top + (rect.height / 2) ? 'above' : 'below';
                break;
            }
        }

        // Handle edge cases
        if (!targetItem && availableItems.length > 0) {
            if (clientY < availableItems[0].getBoundingClientRect().top) {
                targetItem = availableItems[0];
                position = 'above';
            } else if (clientY > availableItems[availableItems.length - 1].getBoundingClientRect().bottom) {
                targetItem = availableItems[availableItems.length - 1];
                position = 'below';
            }
        }

        // Update drop indicators
        if (targetItem) {
            this.currentDropTarget = targetItem;
            this.dropPosition = position;
            targetItem.classList.add('drop-target', `drop-target-${position}`);
        }
    }

    updateDropIndicators(newTarget, position) {
        // Remove previous indicators
        if (this.currentDropTarget) {
            this.currentDropTarget.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
        }

        // Update current target
        this.currentDropTarget = newTarget;
        this.dropPosition = position;

        if (newTarget) {
            newTarget.classList.add('drop-target', `drop-target-${position}`);
        }
    }

    handleMouseUp() {
        this.endDrag();
    }

    handleTouchEnd() {
        this.endDrag();
    }

    endDrag() {
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }

        if (!this.dragStarted) {
            if (this.draggedElement) {
                this.draggedElement.classList.remove('being-pressed', 'ready-to-drag');
            }
            return;
        }

        // Perform the actual reordering
        if (this.currentDropTarget && this.dropPosition) {
            this.reorderTasks();
        }

        // Clean up
        this.cleanup();
    }

    reorderTasks() {
        const tasks = Array.from(this.container.children);
        const draggedIndex = tasks.indexOf(this.draggedElement);
        const targetIndex = tasks.indexOf(this.currentDropTarget);
        
        // Remove ghost element from tasks array
        const ghostIndex = tasks.indexOf(this.ghostElement);
        if (ghostIndex > -1) {
            tasks.splice(ghostIndex, 1);
        }

        // Calculate new position
        let newIndex = targetIndex;
        if (this.dropPosition === 'below') {
            newIndex = targetIndex + 1;
        }
        if (draggedIndex < targetIndex) {
            newIndex--;
        }

        // Reorder DOM elements
        this.draggedElement.remove();
        const referenceNode = tasks[newIndex] || null;
        this.container.insertBefore(this.draggedElement, referenceNode);

        // Dispatch reorder event
        this.container.dispatchEvent(new CustomEvent('tasksReordered', {
            detail: { tasks: Array.from(this.container.children) }
        }));
    }

    cleanup() {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging', 'being-pressed', 'ready-to-drag');
            this.draggedElement.removeAttribute('aria-grabbed');
        }

        if (this.currentDropTarget) {
            this.currentDropTarget.classList.remove('drop-target', 'drop-target-above', 'drop-target-below');
            this.currentDropTarget.removeAttribute('aria-dropeffect');
        }

        if (this.ghostElement && this.ghostElement.parentNode) {
            this.ghostElement.remove();
        }

        // Clear auto-scroll interval
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }

        // Reset touch tracking
        this.lastTouchY = 0;
        this.touchVelocity = 0;
        this.lastTouchTime = 0;

        this.draggedElement = null;
        this.ghostElement = null;
        this.currentDropTarget = null;
        this.dropPosition = null;
        this.dragStarted = false;
    }

    handleAutoScroll(clientY) {
        const containerRect = this.container.getBoundingClientRect();
        const scrollTop = this.container.scrollTop;

        // Clear existing scroll interval
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }

        // Check if cursor is in scroll zones
        if (clientY < containerRect.top + this.SCROLL_ZONE) {
            // Scroll up
            this.scrollInterval = setInterval(() => {
                this.container.scrollTop = Math.max(0, scrollTop - this.SCROLL_SPEED);
                this.updateDropTarget(clientY);
            }, 16);
        } else if (clientY > containerRect.bottom - this.SCROLL_ZONE) {
            // Scroll down
            this.scrollInterval = setInterval(() => {
                this.container.scrollTop = scrollTop + this.SCROLL_SPEED;
                this.updateDropTarget(clientY);
            }, 16);
        }
    }

    handleKeyDown(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.moveTaskUp(taskItem);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveTaskDown(taskItem);
                break;
            case 'Space':
            case 'Enter':
                e.preventDefault();
                if (!this.dragStarted) {
                    this.setupDragStart(taskItem, taskItem.getBoundingClientRect().top);
                }
                break;
            case 'Escape':
                if (this.dragStarted) {
                    this.cleanup();
                }
                break;
        }
    }

    moveTaskUp(taskItem) {
        const prev = taskItem.previousElementSibling;
        if (prev) {
            taskItem.parentNode.insertBefore(taskItem, prev);
            this.announceMove('up');
            this.dispatchReorderEvent();
        }
    }

    moveTaskDown(taskItem) {
        const next = taskItem.nextElementSibling;
        if (next) {
            taskItem.parentNode.insertBefore(next, taskItem);
            this.announceMove('down');
            this.dispatchReorderEvent();
        }
    }

    setupAccessibility() {
        // Create ARIA live region
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('class', 'sr-only');
        document.body.appendChild(this.liveRegion);

        // Add keyboard instructions
        const tasks = this.container.querySelectorAll('.task-item');
        tasks.forEach(task => {
            task.setAttribute('role', 'listitem');
            task.setAttribute('tabindex', '0');
            task.setAttribute('aria-label', `Task: ${task.textContent}. Use arrow keys to reorder.`);
        });
    }

    updateAccessibilityStatus() {
        if (!this.draggedElement || !this.currentDropTarget) return;

        const draggedText = this.draggedElement.textContent;
        const targetText = this.currentDropTarget.textContent;
        const position = this.dropPosition === 'above' ? 'before' : 'after';

        this.liveRegion.textContent = `Moving task "${draggedText}" ${position} "${targetText}"`;
    }

    announceMove(direction) {
        this.liveRegion.textContent = `Task moved ${direction}`;
    }

    dispatchReorderEvent() {
        this.container.dispatchEvent(new CustomEvent('tasksReordered', {
            detail: { tasks: Array.from(this.container.children) }
        }));
    }

    destroy() {
        this.cleanup();
        this.container.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        this.container.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        this.container.removeEventListener('keydown', this.handleKeyDown);
        
        // Remove accessibility elements
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
    }
}