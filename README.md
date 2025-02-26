---
title: Purple Notes Documentation
description: Comprehensive guide on setting up and using Purple Notes, a browser-based notes and tasks application.
---

# Purple Notes

A browser-based notes and tasks application with reminders and theme support.

## Quick Start

1. **Development Mode**
   ```bash
   # Install dependencies
   npm install
   ```
   ```bash
   # Start development server
   npm run dev
   ```

2. **Production Mode**
   ```bash
   # Build for production
   npx vite build
   ```
   ```bash
   # Preview production build
   npx vite preview
   ```
   ```bash
   # Serve production build (alternative)
   npx serve dist
   ```

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

## Vite Configuration

We've recently updated our Vite configuration to enhance development and production workflows. The new configuration includes:

- React fast refresh for an improved development experience.
- Custom server settings to allow access from ngrok subdomains, enabling easier testing on mobile devices.
- CORS enabled by default to support API requests from different origins.
- A fixed port (`3500`) for predictable access and strict port usage to avoid conflicts.

For a detailed guide on how to customize this configuration for your needs, refer to our [Vite Configuration Documentation](docs/vite-configuration.mdx).

## Available Scripts

- `npm run dev` - Starts the development server with hot reload
- `npx vite build` - Creates optimized production build
- `npx vite preview` - Previews production build locally
- `npx serve dist` - Serves production build using static server
- `npm start` - Starts the server without opening browser

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
- See `docs/architecture.md` for app technical architecture details
- See `docs/update.md` for recent changes