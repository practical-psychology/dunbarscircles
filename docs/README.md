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

### Commands

- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run format` - Format code with Prettier
- `npm run screenshots` - Generate screenshots of all pages

### 🌊 Three Distinct Liquid Interactions

1. **Ripple Effects on Buttons**

   - Click interactions create expanding ripple animations
   - Hover states trigger liquid morphing backgrounds
   - Smooth scaling and color transitions

2. **Fluid Gradient Background Shifts**

   - Dynamic background gradients that flow across the screen
   - Morphing blob shapes that continuously transform
   - Subtle floating elements that enhance depth

3. **Pouring Page Load Animation**
   - Initial loading screen with liquid droplet animations
   - Page transitions that flow like water
   - Staggered element animations for organic entry

### 🎨 Design Components

#### LiquidButton

- **Ripple Effect**: Click creates expanding circles with liquid-like motion
- **Morphing Background**: Hover triggers organic shape transformations
- **Variants**: Primary, Secondary, Ghost, and Default styles
- **Sizes**: Small, Medium, and Large options

#### LiquidCard

- **Liquid Border Animation**: Hover activates flowing border effects
- **Wave Motion**: Bottom wave animation on interaction
- **Floating Droplets**: Subtle animated particles
- **Backdrop Blur**: Glass-morphism effect with transparency

#### LiquidInput

- **Floating Labels**: Smooth label transitions on focus
- **Liquid Focus Effects**: Morphing background shapes during interaction
- **Animated Droplets**: Small particles that appear on focus
- **Error States**: Liquid-styled error messaging

#### LiquidThemeToggle

- **Icon Morphing**: Smooth transitions between sun and moon icons
- **Liquid Background**: Flowing gradient that changes with theme
- **Ripple Feedback**: Touch feedback with expanding circles

### 🎭 Animation Keyframes

#### Core Liquid Animations

```css
@keyframes liquidFlow {
  /* Organic shape morphing with rotation */
}

@keyframes liquidRipple {
  /* Expanding ripple effect for interactions */
}

@keyframes liquidWave {
  /* Wave motion using clip-path */
}

@keyframes liquidBlob {
  /* Complex blob morphing with multiple control points */
}

@keyframes liquidGradientShift {
  /* Background gradient position animation */
}

@keyframes liquidPour {
  /* Page entry animation mimicking liquid pouring */
}

@keyframes liquidDroplet {
  /* Small particle animations */
}
```

### 🎯 Performance Optimizations

1. **GPU Acceleration**: All animations use CSS transforms for hardware acceleration
2. **Efficient Keyframes**: Optimized animation curves for smooth 60fps performance
3. **Conditional Rendering**: Animations only activate on user interaction
4. **Reduced Motion Support**: Respects user accessibility preferences
5. **Lightweight Implementation**: CSS-based animations with minimal JavaScript

### 🌈 Color System

#### Liquid Color Variables

```css
:root {
  --liquid-primary: 220 70% 50%; /* Blue base */
  --liquid-secondary: 160 60% 45%; /* Cyan-green */
  --liquid-accent: 280 65% 60%; /* Purple accent */
}

.dark {
  --liquid-primary: 220 70% 60%; /* Lighter blue for dark mode */
  --liquid-secondary: 160 60% 55%; /* Adjusted cyan-green */
  --liquid-accent: 280 65% 70%; /* Brighter purple */
}
```

### 🎪 Interactive Elements

#### Page Transitions

- **Liquid Pour Effect**: Pages enter with a pouring animation
- **Staggered Children**: Elements animate in sequence
- **Smooth Exits**: Pages flow out with liquid motion

#### Background Elements

- **Floating Blobs**: Large morphing shapes in the background
- **Particle System**: Small droplets that float and animate
- **Gradient Flows**: Dynamic color shifts across the viewport

#### Navigation

- **Liquid Hover States**: Navigation items morph on hover
- **Active State Animation**: Current page indicator with liquid effects
- **Smooth Transitions**: Seamless movement between sections

### 🔧 Implementation Details

#### Framer Motion Integration

- Smooth page transitions with liquid-inspired easing curves
- Gesture-based interactions with natural physics
- Staggered animations for organic element entry

#### CSS Custom Properties

- Dynamic animation timing controls
- Theme-aware color transitions
- Responsive animation scaling

#### Accessibility Considerations

- Respects `prefers-reduced-motion` settings
- Maintains focus indicators during animations
- Keyboard navigation preserved through all interactions

### 📱 Responsive Design

#### Mobile Optimizations

- Touch-friendly ripple effects
- Reduced animation complexity on smaller screens
- Optimized performance for mobile devices

#### Desktop Enhancements

- Enhanced hover states with complex morphing
- Larger animation scales for better visibility
- Multi-layer particle effects

### 🎨 Usage Examples

#### Basic Button with Liquid Effects

```tsx
<LiquidButton variant="primary" size="lg">
  Click Me
</LiquidButton>
```

#### Card with Liquid Styling

```tsx
<LiquidCard hover glow>
  <h3>Card Title</h3>
  <p>Card content with liquid effects</p>
</LiquidCard>
```

#### Input with Floating Label

```tsx
<LiquidInput label="Email Address" placeholder="Enter your email" />
```

### 🌟 Visual Hierarchy

The liquid animation system enhances the existing design hierarchy:

1. **Primary Actions**: Most prominent liquid effects (buttons, CTAs)
2. **Secondary Elements**: Subtle morphing and hover states
3. **Background Elements**: Ambient liquid motion for atmosphere
4. **Micro-interactions**: Small droplets and ripples for feedback

### 🔮 Future Enhancements

Potential additions to the liquid animation system:

1. **Sound Integration**: Audio feedback synchronized with liquid animations
2. **Advanced Physics**: More complex fluid simulation effects
3. **Interactive Particles**: User-controllable liquid elements
4. **3D Liquid Effects**: WebGL-based volumetric liquid rendering
5. **Gesture Recognition**: Touch gestures that create liquid trails
