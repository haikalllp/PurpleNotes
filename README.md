---
title: Purple Notes Documentation
description: A comprehensive guide to setting up and running Purple Notes, a browser-based notes and tasks application with reminders and theme support.
---

# Purple Notes

A browser-based notes and tasks application with reminders and theme support.

## Quick Start with Vite Configuration

To get started with Purple Notes, follow these steps to set up your development environment:

1. **Install Dependencies**

   Run the following command to install the necessary dependencies:

   ```bash
   npm install
   ```

2. **Start Development Server**

   We've recently integrated Vite into our project for a faster and more efficient development experience. To start the development server, use:

   ```bash
   npm run dev
   ```

   This command utilizes Vite's development server, providing features like hot module replacement.

3. **Build for Production**

   To create an optimized production build:

   ```bash
   npx vite build
   ```

4. **Preview Production Build**

   Preview your production build locally with:

   ```bash
   npx vite preview
   ```

5. **Serve Production Build**

   Alternatively, you can serve your production build using a static server:

   ```bash
   npx serve dist
   ```

For detailed information on configuring Vite for your project, refer to our [Vite Configuration Documentation](./docs/vite-configuration.mdx).

## Features

- Create and manage notes with reminders
- Create and organize tasks with drag-and-drop
- Light and dark theme support
- Data persistence using localStorage
- Responsive design for all devices
- Modular CSS architecture

## Development Setup

### Prerequisites

- Node.js and npm installed
- Modern web browser (Chrome, Firefox, Edge, or Safari)

## Available Scripts

- `npm run dev` - Starts the development server with hot reload, powered by Vite
- `npx vite build` - Creates optimized production build
- `npx vite preview` - Previews production build locally
- `npx serve dist` - Serves production build using a static server
- `npm start` - Starts the server without opening the browser

### Project Structure

```
purple-notes/
├── src/               # Source code
│   ├── react/         # React components
│       ├── components/   # UI components
│       ├── models/        # Data models
│       ├── services/      # Core services
│       └── utils/         # Utility functions
│   ├── config.js        # application-wide configuration and settings
├── styles/           # Modular CSS files
│   ├── base/         # Base styles
│   ├── layout/       # Layout components
│   ├── components/   # Component styles
│   └── main.css      # CSS entry point
├── docs/             # Documentation
├── sounds/           # Audio assets
├── icons/            # Visual assets
├── app.js           # Application entry
├── index.html       # Main HTML
└── package.json     # Project config
```

### CSS Architecture

The project uses a modular CSS architecture:

- **Base Styles** (`styles/base/`)
  - `variables.css` - Theme variables and custom properties
  - `reset.css` - Base resets and normalizations
  - `utils.css` - Shared utilities and animations

- **Layout** (`styles/layout/`)
  - `grid.css` - Grid system and containers
  - `header.css` - Header component styles
  - `footer.css` - Footer component styles

- **Components** (`styles/components/`)
  - `forms.css` - Form elements and controls
  - `notes.css` - Note cards and interactions
  - `tasks.css` - Task list and interactions
  - `dialogs.css` - Notifications and modals

## Alternative Run Methods

### Using VS Code Live Server

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Using Python HTTP Server

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

## Browser Support

- Chrome (Latest)
- Brave (Latest)
- Edge (Latest)
- OperaGX (Latest)

Requirements:

- CSS Grid support
- CSS Custom Properties
- CSS Flexbox
- Modern JavaScript (ES6+)

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: Focus note input
- `Ctrl/Cmd + T`: Focus task input
- `Escape`: Close dialogs

## Important Notes

- The application requires a local server due to ES module restrictions
- Data is stored in browser's localStorage
- Clear cache to reset all data
- CSS is organized in modular files
- Styles use CSS custom properties for theming

## Troubleshooting

### Common Issues

1. **Module loading errors**
   - Ensure you're running through a local server
   - Don't open index.html directly in browser

2. **Data not persisting**
   - Check if localStorage is enabled
   - Ensure you're not in private/incognito mode

3. **Server already in use**
   - Check if another server is running on port 5500
   - Close other instances or use a different port

4. **Style issues**
   - Clear browser cache
   - Ensure CSS files are loading properly
   - Check browser console for errors
   - Verify browser compatibility

For more detailed information:

- See `howToRun.html` for setup instructions
- See `docs/architecture.md` for technical details
- See `docs/update.md` for recent changes