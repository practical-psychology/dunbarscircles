# Technology Stack & Build System

## Core Technologies

### Frontend Framework

- **React 19** with TypeScript for type safety
- **Vite 5.1.4** as build tool for fast development and optimized builds
- **React Router DOM** for client-side routing (migrated from Next.js App Router)

### Styling & UI

- **Tailwind CSS** with utility-first approach
- **Radix UI** component library for accessible primitives
- **Lucide React** for consistent iconography
- **tailwindcss-animate** for smooth animations
- CSS custom properties for theming (light/dark mode support)

### Key Libraries

- **react-hook-form + Zod** for form validation and type-safe schemas
- **Recharts** for data visualization and charts
- **date-fns** for date manipulation
- **Firebase** for optional authentication
- **class-variance-authority** and **clsx** for conditional styling
- **embla-carousel-react** for carousel components

### Development Tools

- **TypeScript** with strict mode enabled
- **ESLint** with React and TypeScript plugins
- **Prettier** for code formatting
- **Puppeteer** for automated screenshot generation

## Build Commands

```bash
# Development
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
npm run screenshots  # Generate screenshots of all pages
```

## Environment Configuration

- Environment variables use `VITE_` prefix (migrated from `NEXT_PUBLIC_`)
- Firebase configuration through environment variables
- Development server runs on port 3000 with auto-open

## Build Configuration

- **Output directory**: `dist/`
- **Source maps** enabled for debugging
- **Path alias**: `@/*` maps to project root
- **Module resolution**: bundler mode for optimal tree-shaking
- **Target**: ES2020 with modern browser support

## Code Quality Standards

- **Strict TypeScript** with no unused locals/parameters
- **ESLint rules** for React hooks and refresh
- **Prettier formatting** with consistent style
- **No emit** TypeScript compilation (Vite handles bundling)
