/**
 * Represents a task in the application with robust state management
 */
import StorageService from '../services/StorageService.js';
import AudioService from '../services/AudioService.js';

export class Task {
    /**
     * Create a new task
     * @param {Object} data - Task data
     * @param {string} data.text - Task text content
     * @param {boolean} [data.completed=false] - Whether task is completed
     */
    constructor({ text, completed = false }) {
        this.id = Date.now();
        this.text = text;
        this.completed = completed;
        this.lastModified = Date.now();
    }

    /**
     * Toggle the completed state of the task with atomic operation support
     * @returns {Promise<void>}
     */
    async toggleComplete() {
        try {
            // Update local state
            this.completed = !this.completed;
            this.lastModified = Date.now();

            // Update storage atomically
            await StorageService.updateTask(this.id, (task) => {
                task.completed = this.completed;
                task.lastModified = this.lastModified;
                return task;
            });

            // Play completion sound if completed
            if (this.completed) {
                try {
                    await AudioService.playEffect('taskComplete');
                } catch (error) {
                    console.error('Error playing completion sound:', error);
                }
            }
        } catch (error) {
            // Revert local state on failure
            this.completed = !this.completed;
            this.lastModified = Date.now();
            throw new Error('Failed to toggle task completion');
        }
    }

    /**
     * Update task text with atomic operation support
     * @param {string} newText - New task text
     * @returns {Promise<void>}
     */
    async updateText(newText) {
        try {
            const oldText = this.text;
            this.text = newText;
            this.lastModified = Date.now();

            await StorageService.updateTask(this.id, (task) => {
                task.text = newText;
                task.lastModified = this.lastModified;
                return task;
            });
        } catch (error) {
            // Revert on failure
            this.text = oldText;
            throw new Error('Failed to update task text');
        }
    }

    // Static methods for managing tasks collection

    /**
     * Get all tasks with error handling
     * @returns {Array<Task>} Array of tasks
     */
    static getAll() {
        try {
            return StorageService.loadTasks().map(data => {
                const task = new Task({
                    text: data.text,
                    completed: !!data.completed
                });
                task.id = data.id;
                task.lastModified = data.lastModified || Date.now();
                return task;
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    /**
     * Save all tasks with atomic operation support
     * @param {Array<Task>} tasks - Array of tasks to save
     * @returns {Promise<void>}
     */
    static async save(tasks = Task.getAll()) {
        try {
            // Ensure all tasks have proper prototype chain and state
            const processedTasks = tasks.map(task => {
                const processedTask = new Task({
                    text: task.text,
                    completed: Boolean(task.completed)
                });
                processedTask.id = task.id;
                processedTask.lastModified = task.lastModified || Date.now();
                return processedTask;
            });

            await StorageService.saveTasks(processedTasks);
        } catch (error) {
            console.error('Error saving tasks:', error);
            throw new Error('Failed to save tasks');
        }
    }

    /**
     * Add a new task with atomic operation support
     * @param {Task} task - Task to add
     * @returns {Promise<void>}
     */
    static async add(task) {
        try {
            const tasks = Task.getAll();
            tasks.push(task);
            await Task.save(tasks);
        } catch (error) {
            console.error('Error adding task:', error);
            throw new Error('Failed to add task');
        }
    }

    /**
     * Delete a task with atomic operation support and sound effect
     * @param {number} id - ID of task to delete
     * @returns {Promise<void>}
     */
    static async delete(id) {
        try {
            await AudioService.playEffect('trash');
            const tasks = Task.getAll().filter(task => task.id !== id);
            await Task.save(tasks);
        } catch (error) {
            console.error('Error deleting task:', error);
            throw new Error('Failed to delete task');
        }
    }

    /**
     * Reorder tasks with atomic operation support
     * @param {number} fromIndex - Starting index
     * @param {number} toIndex - Target index
     * @returns {Promise<void>}
     */
    static async reorder(fromIndex, toIndex) {
        try {
            const tasks = Task.getAll();
            const [taskToMove] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, taskToMove);
            await Task.save(tasks);
        } catch (error) {
            console.error('Error reordering tasks:', error);
            throw new Error('Failed to reorder tasks');
        }
    }

    /**
     * Clear all completed tasks with atomic operation support
     * @returns {Promise<void>}
     */
    static async clearCompleted() {
        try {
            await AudioService.playEffect('clearAll');
            const tasks = Task.getAll().filter(task => !task.completed);
            await Task.save(tasks);
        } catch (error) {
            console.error('Error clearing completed tasks:', error);
            throw new Error('Failed to clear completed tasks');
        }
    }

    /**
     * Clear all tasks with atomic operation support
     * @returns {Promise<void>}
     */
    static async clearAll() {
        try {
            await AudioService.playEffect('clearAll');
            await Task.save([]);
        } catch (error) {
            console.error('Error clearing all tasks:', error);
            throw new Error('Failed to clear all tasks');
        }
    }
}