/**
 * Manages the collection and display of tasks
 */
import { Task } from '../../models/Task.js';
import { TaskItem } from './TaskItem.js';
import { DOMUtils } from '../../utils/DOMUtils.js';
import AudioService from '../../services/AudioService.js';

export class TaskList {
    /**
     * @param {Object} options
     * @param {string} options.containerId - ID of container element
     */
    constructor({ containerId }) {
        this.container = DOMUtils.getElement(containerId);
        this.tasks = [];
        this.taskItems = new Map(); // Map of task ID to TaskItem instance
        this.dragStartIndex = null;
        this.clearButtonListener = null;
        this.initialize();
    }

    /**
     * Initialize task list
     */
    initialize() {
        // Show loading state
        this.showLoadingState();
        
        // Load tasks with a small delay to show loading state
        setTimeout(() => {
            this.loadTasks();
            this.setupClearAllButton();
        }, 100);
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <span>Loading tasks...</span>
            </div>
        `;
    }

    /**
     * Load tasks from storage and display them
     */
    loadTasks() {
        this.tasks = Task.getAll();
        this.displayTasks();
    }

    /**
     * Display all tasks
     */
    displayTasks() {
        // Clear the container first
        this.container.innerHTML = '';

        // If no tasks, show empty state
        if (this.tasks.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>No tasks yet. Add your first task!</p>
                </div>
            `;
            return;
        }
        
        // Clear old task item references and cleanup
        this.taskItems.forEach(taskItem => taskItem.destroy?.());
        this.taskItems.clear();
        
        // Create and display task items
        this.tasks.forEach((task, index) => {
            const taskItem = new TaskItem({
                task,
                index,
                onDelete: () => this.handleTaskDelete(task),
                onComplete: () => this.handleTaskComplete(task),
                onDrop: (dropIndex) => this.handleTaskDrop(index, dropIndex)
            });
            
            this.taskItems.set(task.id, taskItem);
            this.container.appendChild(taskItem.element);
        });
    }

    /**
     * Add a new task
     * @param {Task} task - Task to add
     */
    addTask(task) {
        this.tasks.push(task);
        Task.save(this.tasks);
        this.displayTasks();
    }

    /**
     * Handle task deletion
     * @param {Task} task - Task being deleted
     */
    handleTaskDelete(task) {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.taskItems.delete(task.id);
        Task.save(this.tasks);
        this.displayTasks(); // Refresh display
    }

    /**
     * Handle task completion
     * @param {Task} task - Task being completed
     */
    handleTaskComplete(task) {
        Task.save(this.tasks);
        // Refresh display to show/hide delete button
        this.displayTasks();
    }

    /**
     * Handle task drop during drag and drop
     * @param {number} fromIndex - Starting index
     * @param {number} toIndex - Target index
     */
    handleTaskDrop(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // Ensure indices are valid
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= this.tasks.length || toIndex > this.tasks.length) {
            console.error('Invalid indices for task reordering');
            return;
        }

        // Create a copy of tasks array and get the task being moved
        const updatedTasks = [...this.tasks];
        const [movedTask] = updatedTasks.splice(fromIndex, 1);

        // Insert the task at the new position
        updatedTasks.splice(toIndex, 0, movedTask);

        // Update the tasks array
        this.tasks = updatedTasks;

        // Update all task indices immediately
        this.tasks.forEach((task, index) => {
            const taskItem = this.taskItems.get(task.id);
            if (taskItem) {
                taskItem.updateIndex(index);
            }
        });

        // Save to storage
        Task.save(this.tasks);

        // Update the display to reflect changes
        this.displayTasks();
    }

    /**
     * Set up clear all button functionality
     */
    setupClearAllButton() {
        const clearButton = document.querySelector('.tasks-section .clear-btn');
        if (clearButton) {
            // Remove existing listener if any
            if (this.clearButtonListener) {
                clearButton.removeEventListener('click', this.clearButtonListener);
            }

            this.clearButtonListener = async () => {
                try {
                    const result = await DOMUtils.showConfirmation({
                        message: 'Are you sure you want to delete all tasks?'
                    });

                    if (result) {
                        await AudioService.playEffect('clearAll');
                        await this.clearAll();
                    } else {
                        AudioService.stopEffect('clearAll');
                    }
                } catch (error) {
                    console.error('Error during clear all:', error);
                    // Proceed with clearing even if sound fails
                    await this.clearAll();
                }
            };

            clearButton.addEventListener('click', this.clearButtonListener);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clean up task items
        this.taskItems.forEach(taskItem => taskItem.destroy?.());
        this.taskItems.clear();

        // Remove clear button listener
        const clearButton = document.querySelector('.tasks-section .clear-btn');
        if (clearButton && this.clearButtonListener) {
            clearButton.removeEventListener('click', this.clearButtonListener);
        }
    }

    /**
     * Get task by ID
     * @param {number} id - Task ID
     * @returns {Task|undefined}
     */
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    /**
     * Get completed tasks
     * @returns {Array<Task>}
     */
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    /**
     * Get incomplete tasks
     * @returns {Array<Task>}
     */
    getIncompleteTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    /**
     * Clear completed tasks
     */
    async clearCompleted() {
        try {
            await AudioService.playEffect('clearAll');
            this.tasks = this.getIncompleteTasks();
            Task.save(this.tasks);
            this.displayTasks();
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            // Proceed with clearing even if sound fails
            this.tasks = this.getIncompleteTasks();
            Task.save(this.tasks);
            this.displayTasks();
        }
    }

    /**
     * Clear all tasks
     */
    async clearAll() {
        try {
            await AudioService.playEffect('clearAll');
        } catch (error) {
            console.error('Error playing clear sound:', error);
        }
        this.tasks = [];
        Task.save(this.tasks);
        this.displayTasks();
    }

    /**
     * Get task count
     * @returns {Object} Object containing total, completed, and incomplete counts
     */
    getTaskCounts() {
        return {
            total: this.tasks.length,
            completed: this.getCompletedTasks().length,
            incomplete: this.getIncompleteTasks().length
        };
    }
}