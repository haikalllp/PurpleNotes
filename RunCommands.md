# Purple Notes Run Commands

## Local Development

### Option 1: Production Preview
Use this method to test the production build locally:
```bash
# Build for production
npx vite build

# Preview the production build
npx vite preview
```

### Option 2: Development Server
Use this method during development for hot-reload features:
```bash
# Build for production
npx vite build

# Start development server
npm run dev
```

## Production Deployment

### Using Static File Server
Deploy the production build using a static file server:
```bash
# Build for production
npx vite build

# Install serve globally (if not already installed)
npm install -g serve

# Start static server (Method 1)
npx serve dist

# OR start static server (Method 2)
serve dist
```

## Notes
- The `dist` folder contains the production build output
- Use `npm run dev` for local development with hot-reload
- Use `npx vite preview` to test production builds locally
- Use `serve` or similar static file servers for production deployment