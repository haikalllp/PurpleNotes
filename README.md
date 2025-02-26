---
title: "Purple Notes Development Environment Setup with Vite"
description: "A comprehensive guide to setting up the development environment for Purple Notes using Vite, including installation, project structure, and available scripts."
---

# Purple Notes Development Environment Setup with Vite

Purple Notes is a browser-based application for managing notes and tasks, featuring reminders, theme support, and a responsive design. This guide covers the setup of the development environment with Vite, reflecting the latest updates to the project.

## Getting Started

To set up your development environment for Purple Notes, follow these steps:

### Prerequisites

- Ensure you have Node.js and npm installed on your system.
- A modern web browser (Chrome, Firefox, Edge, or Safari) is required.

### Installation

1. **Clone the repository**

   Start by cloning the Purple Notes repository to your local machine.

   ```bash
   git clone <repository-url>
   cd purple-notes
   ```

2. **Install dependencies**

   Install the project dependencies using npm.

   ```bash
   npm install
   ```

3. **Start the development server**

   Run the development server with hot module replacement to see your changes in real-time.

   ```bash
   npm run dev
   ```

## Available Scripts

Purple Notes uses Vite for an optimized development and build process. Here are the available scripts:

- `npm run dev` - Starts the Vite development server with hot reload at `localhost:3000`.
- `npx vite build` - Creates an optimized production build of your project.
- `npx vite preview` - Serves the production build locally for preview before deployment.
- `npx serve dist` - Serves the production build using a static server (alternative to `vite preview`).

## Project Structure

Understanding the project structure is crucial for effective development. Here's an overview of the key directories and files:

```plaintext
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

## CSS Architecture

Purple Notes adopts a modular CSS architecture to maintain style scalability and manageability:

- **Base Styles** (`styles/base/`): Contains theme variables, base resets, and shared utilities.
- **Layout** (`styles/layout/`): Defines styles for grid systems, headers, and footers.
- **Components** (`styles/components/`): Includes CSS for form elements, note cards, task lists, and modals.

## Browser Support

Purple Notes is designed to work on the latest versions of Chrome, Brave, Edge, and OperaGX. It requires support for CSS Grid, Custom Properties, Flexbox, and modern JavaScript (ES6+).

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: Focus the note input field.
- `Ctrl/Cmd + T`: Focus the task input field.
- `Escape`: Close any open dialogs.

## Important Notes

- A local server is required due to ES module restrictions.
- Data is stored in the browser's localStorage.
- To reset all data, clear the browser cache.
- CSS is organized into modular files for easy maintenance.

## Troubleshooting

If you encounter issues, check the following:

1. **Module loading errors**: Ensure you're serving the project through a local server, not by opening `index.html` directly.
2. **Data not persisting**: Verify localStorage is enabled and you're not in incognito mode.
3. **Server port conflicts**: Ensure no other service is running on the same port.
4. **Style issues**: Clear the browser cache and check for errors in the browser console.

For more detailed information on the architecture and recent changes, refer to `docs/architecture.md` and `docs/update.md`, respectively.