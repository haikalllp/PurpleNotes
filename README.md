---
title: Purple Notes - A Vite and React Powered Note-Taking App
description: Get started with Purple Notes, now powered by Vite and React for an enhanced development experience and performance.
---

# Purple Notes

A browser-based notes and tasks application with reminders and theme support, now leveraging the power of Vite and React for a modern, efficient development workflow and enhanced user experience.

## Introduction to the New Stack

Purple Notes has transitioned to a new technology stack, embracing Vite as its build tool and React for the UI. This change aims to improve the development experience with faster builds, hot module replacement, and a more intuitive component-based architecture for building user interfaces.

- **Vite**: A modern build tool that significantly improves the development server start time and offers out-of-the-box support for TypeScript, JSX, CSS, and more.
- **React**: A JavaScript library for building user interfaces, enabling the development of dynamic, high-performance web applications with a component-based architecture.

## Quick Start with Vite and React

To get started with the new Purple Notes, follow these steps to set up your development environment:

1. **Development Mode**

   Ensure you have Node.js (version 12.x or higher) and npm installed on your system.

   ```bash
   # Install dependencies
   npm install
   ```

   ```bash
   # Start the Vite development server
   npm run dev
   ```

2. **Production Mode**

   Build and preview your application with Vite's optimized production build tools.

   ```bash
   # Build for production
   npx vite build
   ```

   ```bash
   # Preview production build
   npx vite preview
   ```

   Alternatively, serve your production build using a static server:

   ```bash
   # Serve production build
   npx serve dist
   ```

## Features

- Create and manage notes with reminders.
- Organize tasks with drag-and-drop functionality.
- Light and dark theme support for user preference.
- Data persistence using localStorage for offline access.
- Responsive design ensures a seamless experience on all devices.
- Modular CSS architecture for maintainable and scalable styling.

## Development Setup

### Prerequisites

- Node.js and npm installed on your machine.
- A modern web browser (Chrome, Firefox, Edge, or Safari) for testing.

## Available Scripts

- `npm run dev`: Starts the Vite development server with hot reload enabled.
- `npx vite build`: Creates an optimized production build.
- `npx vite preview`: Previews the production build locally.
- `npx serve dist`: Serves the production build using a static server.
- `npm start`: Starts the server without automatically opening the browser.

## Links to Detailed Guides

For more in-depth information on setup, configuration, and migration to the new stack, please refer to the following resources:

- [Architecture Overview](docs/architecture.md): Detailed breakdown of the new application architecture with Vite and React.
- [Update Guide](docs/update.md): Step-by-step instructions for migrating to the new version of Purple Notes.
- [Vite Configuration](docs/vite-configuration.mdx) (planned): Comprehensive guide to configuring Vite for optimal development and production builds.

By following these guides, you'll be well-equipped to take full advantage of the new technology stack and contribute to the Purple Notes project.