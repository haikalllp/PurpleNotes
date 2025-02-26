---
title: "Purple Notes: Development Setup with Vite"
description: "Learn how to set up your development environment for Purple Notes using Vite, including prerequisites, installation, and useful commands."
---

# Purple Notes

A browser-based notes and tasks application with reminders and theme support, now leveraging Vite for an enhanced development experience.

## Introduction to Vite and React in the Project

Vite provides a faster and more efficient development environment for modern web projects. By integrating Vite into Purple Notes, developers can enjoy features like instant server start, hot module replacement (HMR), and optimized build commands. This setup is designed to work seamlessly with React, enabling rapid development and efficient bundling for production.

## Getting Started with Vite

To begin working with Vite in the Purple Notes project, ensure you have the following prerequisites:

### Prerequisites

- Node.js (version 12.x or higher) and npm installed
- A modern web browser (Chrome, Firefox, Edge, or Safari)

### Installation

1. Clone the Purple Notes repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Install the project dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

This command utilizes Vite to launch a local development server with hot module replacement, allowing you to see changes in real-time.

## Development Environment Setup

After installing the necessary dependencies, you can begin developing with the following commands:

### Useful Commands and Scripts

- **Development Mode**: Start the development server with HMR.

```bash
npm run dev
```

- **Production Mode**: Build the application for production using Vite's optimized build process.

```bash
npx vite build
```

- **Preview Production Build**: Preview the production build locally to ensure everything runs smoothly before deployment.

```bash
npx vite preview
```

- **Serve Production Build**: Alternatively, serve your production build using a static server.

```bash
npx serve dist
```

### Project Structure

Understanding the project structure is crucial for efficient development. Here's an overview of the key directories and files:

```
purple-notes/
├── src/               # Source code
│   ├── react/         # React components
│       ├── components/   # UI components
│       ├── models/        # Data models
│       ├── services/      # Core services
│       └── utils/         # Utility functions
│   ├── config.js        # Application-wide configuration and settings
├── styles/            # Modular CSS files
│   ├── base/          # Base styles
│   ├── layout/        # Layout components
│   ├── components/    # Component styles
│   └── main.css       # CSS entry point
├── docs/              # Documentation
├── sounds/            # Audio assets
├── icons/             # Visual assets
├── app.js             # Application entry
├── index.html         # Main HTML
└── package.json       # Project config
```

## Alternative Run Methods

For those who prefer not to use the command line, alternative methods to run the project include:

- **Using VS Code Live Server**: Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".
- **Using Python HTTP Server**:

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

## Browser Support

Purple Notes supports the latest versions of Chrome, Brave, Edge, and OperaGX. Ensure your browser supports CSS Grid, Custom Properties, Flexbox, and modern JavaScript (ES6+) for the best experience.

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: Focus note input
- `Ctrl/Cmd + T`: Focus task input
- `Escape`: Close dialogs

## Important Notes

The application requires a local server due to ES module restrictions and stores data in the browser's localStorage. Clearing the cache resets all data. For styling, CSS is organized in modular files using custom properties for easy theming.

## Troubleshooting

Common issues include module loading errors, data not persisting, server port conflicts, and style issues. Ensure you're running through a local server, localStorage is enabled, and no other server is running on the same port. Clearing the browser cache and verifying browser compatibility can resolve style issues.

For more detailed information, refer to `howToRun.html` for setup instructions, `docs/architecture.md` for technical details, and `docs/update.md` for recent changes.