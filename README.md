# Dunbar's Number Visualization

A modern web application that visualizes Robin Dunbar's theory of social relationships, which suggests cognitive limits to the number of stable social relationships humans can maintain.

## 🎯 Core Concept

The app explores Dunbar's hierarchy of social relationships, which categorizes human connections into five main groups:

- **Inner Circle (5 people)** - Daily contact, high emotional investment
- **Sympathy Group (15 people)** - Weekly contact, close friends
- **Affinity Group (50 people)** - Monthly contact, party invitees
- **Active Network (150 people)** - Quarterly contact, meaningful conversations
- **Recognition Group (500 people)** - Yearly contact, faces and names

## 🛠 Technology Stack

### Frontend Framework

- Vite 5.1.4 for fast development and building
- React 19 with TypeScript
- React Router DOM for client-side routing
- Modern ES6+ features

### Styling & UI

- Tailwind CSS for utility-first styling
- Radix UI component library
- Lucide React icons
- Custom animations and gradients

### Key Libraries

- react-hook-form + zod for form validation
- recharts for data visualization
- Custom theme implementation
- date-fns for date manipulation
- embla-carousel for carousels

## 📁 Project Structure

```text
src/
├── main.tsx           # App entry point
├── App.tsx            # Main app with routing
├── index.css          # Global styles
├── vite-env.d.ts      # Vite environment types
├── components/        # Shared components
│   └── PageLayout.tsx # Consistent page layout wrapper
├── data/              # Shared data
│   └── dunbarLevels.ts # Dunbar hierarchy definitions
└── pages/             # Route components
    ├── HomePage.tsx       # Overview page (main landing)
    ├── RadialPage.tsx     # Radial diagram visualization
    ├── LevelsPage.tsx     # Detailed level breakdown
    ├── NetworkPage.tsx    # Network graph and inventory
    ├── DigitalPage.tsx    # Digital parallels exploration
    ├── LifecyclePage.tsx  # Life stage comparisons
    ├── DashboardPage.tsx  # User authentication dashboard
    ├── SitemapPage.tsx    # Site navigation overview
    └── NotFoundPage.tsx   # 404 error page
```

## 🌟 Key Features

### Dedicated Pages for Each Visualization

- **Overview** (`/`) - Interactive network diagram and relationship category overview
- **Radial View** (`/radial`) - Concentric circles visualization with cognitive load mapping
- **Levels** (`/levels`) - Detailed breakdown of each relationship level
- **Network Graph** (`/network`) - Personal relationship inventory and network visualization
- **Digital Parallels** (`/digital`) - How Dunbar's hierarchy translates to digital relationships
- **Life Stages** (`/lifecycle`) - Relationship patterns across different life stages

### Interactive Elements

- Tabbed interface for different views
- Responsive design for all devices
- Theme support (light/dark mode)

### Modern UI/UX

- Clean, intuitive interface
- Smooth animations and transitions
- Accessible components

## 🚀 Development

The project is set up with:

- TypeScript for type safety
- ESLint and Prettier for code quality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Configure Firebase credentials with `VITE_` prefix

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run start
```

### Other Commands

- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run format` - Format code with Prettier
- `npm run screenshots` - Generate screenshots of all pages

## 🔧 Migration from Next.js

This project has been migrated from Next.js to Vite for improved development experience and faster builds. Key changes include:

- Replaced Next.js App Router with React Router DOM
- Updated environment variables from `NEXT_PUBLIC_` to `VITE_` prefix
- Converted Next.js pages to React Router route components
- Updated build configuration from Next.js to Vite
- Maintained 100% functionality and UI consistency
