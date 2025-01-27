/**
 * Represents a task in the application
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
    }

    /**
     * Toggle the completed state of the task
     * @returns {Promise<void>}
     */
    async toggleComplete() {
        this.completed = !this.completed;
        if (this.completed) {
            await AudioService.playEffect('taskComplete');
        }
        Task.save();
    }

    // Static methods for managing tasks collection

    /**
     * Get all tasks
     * @returns {Array<Task>} Array of tasks
     */
    static getAll() {
        return StorageService.loadTasks().map(data => {
            const task = new Task(data);
            Object.assign(task, data);
            return task;
        });
    }

    /**
     * Save all tasks
     * @param {Array<Task>} tasks - Array of tasks to save
     */
    static save(tasks = Task.getAll()) {
        StorageService.saveTasks(tasks);
    }

    /**
     * Add a new task
     * @param {Task} task - Task to add
     */
    static add(task) {
        const tasks = Task.getAll();
        tasks.push(task);
        Task.save(tasks);
    }

    /**
     * Delete a task
     * @param {number} id - ID of task to delete
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await AudioService.playEffect('trash');
        const tasks = Task.getAll().filter(task => task.id !== id);
        Task.save(tasks);
    }

    /**
     * Reorder tasks by swapping positions
     * @param {number} fromIndex - Starting index
     * @param {number} toIndex - Target index
     */
    static reorder(fromIndex, toIndex) {
        const tasks = Task.getAll();
        const [taskToMove] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, taskToMove);
        Task.save(tasks);
    }

    /**
     * Clear all completed tasks
     * @returns {Promise<void>}
     */
    static async clearCompleted() {
        await AudioService.playEffect('clearAll');
        const tasks = Task.getAll().filter(task => !task.completed);
        Task.save(tasks);
    }

    /**
     * Clear all tasks
     * @returns {Promise<void>}
     */
    static async clearAll() {
        await AudioService.playEffect('clearAll');
        Task.save([]);
    }
}