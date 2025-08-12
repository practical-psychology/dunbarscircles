# Design Document - YAKW (Dunbar's Number Visualization)

## Project Overview

A modern React/TypeScript web application that visualizes Robin Dunbar's theory of social relationships, exploring the cognitive limits to stable social relationships humans can maintain. The application is fully client-side with privacy-first data processing.

## Architecture

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 5.1.4 for fast development and optimized builds
- **Routing**: React Router DOM for client-side navigation
- **Styling**: Tailwind CSS with utility-first approach
- **UI Components**: Radix UI component library for accessible primitives
- **Icons**: Lucide React for consistent iconography
- **Data Visualization**: Recharts for charts and Canvas API for interactive diagrams
- **Form Handling**: react-hook-form with Zod validation
- **Authentication**: Firebase integration (optional)
- **Date Handling**: date-fns library
- **Animations**: tailwindcss-animate for smooth transitions

### Component Architecture

```
├── src/
│   ├── main.tsx              # Application entry point with React Router
│   ├── App.tsx               # Main app with route definitions
│   ├── index.css             # Global styles and Tailwind imports
│   └── pages/                # Page components for routing
│       ├── HomePage.tsx      # Landing page (/)
│       ├── RadialPage.tsx    # Radial visualization (/radial)
│       ├── LevelsPage.tsx    # Level details (/levels)
│       ├── NetworkPage.tsx   # Network diagram (/network)
│       ├── DigitalPage.tsx   # Digital parallels (/digital)
│       ├── LifecyclePage.tsx # Life stage analysis (/lifecycle)
│       ├── DashboardPage.tsx # User dashboard (/dashboard)
│       ├── SitemapPage.tsx   # Site navigation (/sitemap)
│       └── NotFoundPage.tsx  # 404 error page
├── components/               # Shared React components (root level)
│   ├── ui/                  # Base UI components (Radix UI primitives)
│   ├── network-diagram.tsx
│   ├── radial-diagram.tsx
│   ├── relationship-inventory.tsx
│   ├── digital-parallels-explorer.tsx
│   ├── life-stage-comparison.tsx
│   ├── level-details.tsx
│   ├── contact-manager.tsx
│   ├── export-manager.tsx
│   └── theme-provider.tsx
├── hooks/                   # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                     # Utility libraries and helpers
│   ├── utils.ts
│   ├── auth-utils.ts        # Firebase authentication utilities
│   └── export-utils.ts      # Export functionality for PNG/SVG/JSON/CSV
├── types/                   # TypeScript type definitions
│   └── relationships.ts     # Core relationship and level type definitions
├── data/                    # Static data files (JSON, CSV)
└── public/                  # Static assets and images
```

## Core Features

### 1. Dunbar's Hierarchy Visualization

The application visualizes five main relationship categories:

- **Inner Circle (5 people)** - Daily contact, high emotional investment
- **Sympathy Group (15 people)** - Weekly contact, close friends
- **Affinity Group (50 people)** - Monthly contact, party invitees
- **Active Network (150 people)** - Quarterly contact, meaningful conversations
- **Recognition Group (500 people)** - Yearly contact, faces and names

### 2. Interactive Visualizations

#### Network Diagram Component

- Force-directed graph showing relationship connections
- Interactive nodes with hover states and click handlers
- Dynamic positioning based on relationship strength
- Visual indicators for relationship decay

#### Radial Diagram Component

- Concentric circles representing relationship levels
- Cognitive load visualization with progress indicators
- Mental bandwidth calculations
- Animated background rings for visual appeal

#### Relationship Inventory

- Personal relationship management system
- Social media data import (Facebook JSON, LinkedIn CSV)
- Relationship health tracking and decay warnings
- Force-directed network simulation

### 3. Data Import & Management

- **Facebook Integration**: Import friends.json from Facebook data export
- **LinkedIn Integration**: Import connections.csv from LinkedIn export
- **Auto-categorization**: Intelligent sorting based on interaction patterns
- **Relationship Tracking**: Monitor contact frequency and relationship strength

## Design Patterns

### Component Design

- Functional components with React hooks
- TypeScript interfaces for type safety
- Props-based component communication
- Separation of concerns between UI and business logic

### State Management

- Local component state with useState
- Effect hooks for side effects and animations
- Custom hooks for reusable logic
- No global state management (appropriate for current scope)

### Styling Approach

- Utility-first CSS with Tailwind
- Component-scoped styling
- Responsive design patterns
- Dark/light theme support via theme provider

## User Experience

### Navigation

- Single-page application with client-side routing
- Intuitive page structure with clear navigation
- Responsive design for mobile and desktop

### Interactivity

- Hover states and click handlers on visualizations
- Real-time animations and transitions
- Progressive disclosure of information
- Accessible keyboard navigation

### Data Visualization

- Color-coded relationship levels
- Interactive tooltips and detail panels
- Progress indicators for relationship health
- Visual warnings for relationship decay

## Performance Considerations

### Optimization Strategies

- Vite for fast development and optimized builds
- Code splitting with React Router
- Efficient re-rendering with proper dependency arrays
- Canvas-based animations for smooth performance

### Data Handling

- Client-side data processing
- Efficient algorithms for force-directed layouts
- Debounced user interactions
- Lazy loading of components where appropriate

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

## Current Implementation Status

### Completed Features

- ✅ Full React Router DOM navigation system with 9 main routes
- ✅ All core visualization components implemented and functional
- ✅ Social media data import (Facebook JSON, LinkedIn CSV)
- ✅ Interactive force-directed network diagrams with Canvas API
- ✅ Radial relationship visualization with cognitive load indicators
- ✅ Relationship inventory management system
- ✅ Digital parallels exploration component
- ✅ Life stage comparison analysis
- ✅ Complete export manager with PNG/SVG/JSON/CSV export capabilities
- ✅ Firebase authentication with Google sign-in and logout
- ✅ User dashboard with profile management
- ✅ Responsive design with mobile support
- ✅ Dark/light theme support with theme provider
- ✅ TypeScript type safety throughout with strict mode
- ✅ All TypeScript compilation errors resolved

### Future Enhancements

- Advanced filtering and search functionality
- Progressive Web App (PWA) capabilities
- Enhanced analytics and relationship insights
- Performance optimizations for large datasets
- Comprehensive testing suite
- User documentation and tutorials
