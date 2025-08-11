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

- Next.js 15.2.4 with App Router
- React 19 with TypeScript
- Modern ES6+ features

### Styling & UI

- Tailwind CSS for utility-first styling
- Radix UI component library
- Lucide React icons
- Custom animations and gradients

### Key Libraries

- react-hook-form + zod for form validation
- recharts for data visualization
- next-themes for theme switching
- date-fns for date manipulation
- embla-carousel for carousels

## 📁 Project Structure

```text
/app/
├── layout.tsx     # Root layout with fonts and metadata
├── page.tsx       # Main application component
└── globals.css    # Global styles

/components/
├── ui/            # 50+ Radix UI-based design system components
├── network-diagram.tsx        # Interactive network visualization
├── radial-diagram.tsx         # Concentric circles view
├── level-details.tsx          # Detailed level information
├── relationship-inventory.tsx # Personal relationship tracker
├── digital-parallels-explorer.tsx # Digital age comparisons
└── life-stage-comparison.tsx  # Lifecycle relationship changes
```

## 🌟 Key Features

### Multiple Visualization Modes

- Network diagram showing relationship connections
- Radial diagram with concentric circles
- Detailed level information
- Personal relationship inventory
- Digital age parallels
- Life stage comparisons

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
