# Project Structure & Organization

## Root Directory Layout

```
├── src/                    # Main application source
├── components/             # Shared React components (root level)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and helpers
├── data/                   # Static data files (JSON, CSV)
├── public/                 # Static assets and images
├── styles/                 # Global CSS files
├── .kiro/                  # Kiro IDE configuration and steering
├── dist/                   # Build output directory
└── node_modules/           # Dependencies
```

## Source Directory (`src/`)

```
src/
├── main.tsx               # Application entry point with React Router
├── App.tsx                # Main app component with route definitions
├── index.css              # Global styles and Tailwind imports
├── vite-env.d.ts          # Vite environment type definitions
├── components/            # Duplicate component structure (legacy)
├── data/                  # Duplicate data structure (legacy)
└── pages/                 # Page components for routing
    ├── HomePage.tsx       # Landing page (/)
    ├── RadialPage.tsx     # Radial visualization (/radial)
    ├── LevelsPage.tsx     # Level details (/levels)
    ├── NetworkPage.tsx    # Network diagram (/network)
    ├── DigitalPage.tsx    # Digital parallels (/digital)
    ├── LifecyclePage.tsx  # Life stage analysis (/lifecycle)
    ├── DashboardPage.tsx  # User dashboard (/dashboard)
    ├── SitemapPage.tsx    # Site navigation (/sitemap)
    └── NotFoundPage.tsx   # 404 error page
```

## Component Organization

### Root Components (`components/`)

- **Primary location** for all shared components
- Each component in its own `.tsx` file
- UI primitives in `components/ui/` subdirectory (Radix UI components)

### Key Components

- `network-diagram.tsx` - Force-directed graph visualization
- `radial-diagram.tsx` - Concentric circles relationship view
- `relationship-inventory.tsx` - Personal relationship management
- `digital-parallels-explorer.tsx` - Digital relationship mapping
- `life-stage-comparison.tsx` - Life stage analysis
- `level-details.tsx` - Dunbar level breakdowns
- `contact-manager.tsx` - Contact management functionality
- `theme-provider.tsx` - Dark/light theme context

## Hooks Directory (`hooks/`)

- `use-mobile.tsx` - Mobile device detection
- `use-toast.ts` - Toast notification management
- Custom hooks follow `use-*` naming convention

## Library Directory (`lib/`)

- `utils.ts` - General utility functions and helpers
- `auth-utils.ts` - Firebase authentication utilities
- Shared business logic and helper functions

## Data Directory (`data/`)

- `facebook_friends.json` - Sample Facebook data format
- `linkedin_connections_v2.csv` - Sample LinkedIn data format
- Static configuration and sample data files

## Styling Conventions

### File Organization

- `src/index.css` - Global styles and Tailwind imports
- `styles/globals.css` - Additional global styles
- Component-specific styles use Tailwind classes inline
- CSS custom properties for theme variables

### Naming Conventions

- **Components**: PascalCase (e.g., `NetworkDiagram.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useMobile`)
- **Utilities**: camelCase (e.g., `formatDate`)
- **Types/Interfaces**: PascalCase (e.g., `Person`, `Level`)

## Configuration Files

### Build & Development

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS processing

### Code Quality

- `.eslintrc.json` - ESLint rules and configuration
- `package.json` - Dependencies and npm scripts

### Deployment

- `firebase.json` - Firebase hosting configuration
- `firestore.rules` - Firestore security rules

## Import Conventions

### Path Aliases

- `@/*` - Maps to project root for clean imports
- Relative imports for local files
- Absolute imports for shared utilities

### Import Order

1. React and external libraries
2. Internal components and hooks
3. Utilities and types
4. Relative imports
