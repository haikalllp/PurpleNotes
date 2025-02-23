/**
 * Application configuration and constants
 */
export const AUDIO_CONFIG = {
    notification: {
        src: 'sounds/notification.mp3',
        loop: true
    },
    switchOn: {
        src: 'sounds/SwitchOnEdit.mp3',
        volume: 1.0,
        currentTime: 0
    },
    switchOff: {
        src: 'sounds/SwitchOffEdit.mp3',
        volume: 1.0,
        currentTime: 0
    },
    reminderDismiss: {
        src: 'sounds/ReminderButton.mp3',
        volume: 1.0,
        currentTime: 0
    },
    trash: {
        src: 'sounds/Trashed.mp3',
        volume: 0.35,
        currentTime: 0.35
    },
    taskComplete: {
        src: 'sounds/Scratch3.mp3',
        volume: 0.10,
        currentTime: 0.12
    },
    clearAll: {
        src: 'sounds/Scratch1.mp3',
        volume: 1.0,
        currentTime: 0.6
    }
};

export const DOM_IDS = {
    noteForm: 'noteForm',
    taskForm: 'taskForm',
    notesContainer: 'notesContainer',
    taskList: 'taskList',
    enableReminder: 'enableReminder',
    noteReminder: 'noteReminder',
    themeToggle: 'themeToggle'
};

export const STORAGE_KEYS = {
    notes: 'notes',
    tasks: 'tasks',
    theme: 'theme'
};

export const THEMES = {
    light: 'light',
    dark: 'dark'
};

export const ANIMATION_DURATION = {
    fadeOut: 300,
    shake: 400,
    reminderCheck: 1000
};