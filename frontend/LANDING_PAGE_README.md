# Futuristic Landing Page - Team Chat Application

A cutting-edge, 2025-style landing page built with React, Next.js, Tailwind CSS, and Framer Motion.

## 🎨 Features

### Visual Effects
- **Custom Animated Cursor** - Follows mouse movement with hover effects
- **Floating Geometric Shapes** - Animated background elements with blur effects
- **Glassmorphism UI** - Modern glass-like navigation and cards
- **Gradient Animations** - Dynamic gradient text and backgrounds
- **3D Transform Effects** - Parallax scrolling and depth effects
- **Smooth Scroll Animations** - Intersection Observer-based reveals

### Components

#### 1. **CustomCursor**
- Custom cursor that follows mouse position
- Scales on hover over interactive elements
- Disabled on mobile/touch devices
- Uses `useMousePosition` hook

#### 2. **FloatingShapes**
- Animated background shapes with Framer Motion
- Multiple gradient colors (blue, purple, cyan)
- Continuous floating animations
- Blur effects for depth

#### 3. **GlassNavigation**
- Fixed glassmorphism navigation bar
- Smooth scroll to sections
- Active section indicator
- Links to login page

#### 4. **HeroSection**
- Full-screen hero with animated gradients
- Glitch text effect animation
- 3D demo preview with parallax
- CTA buttons with hover effects

#### 5. **FeatureCard**
- Glassmorphism card design
- Icon, title, and description
- Scroll-triggered animations
- Hover scale effects

#### 6. **InteractiveStats**
- Animated counter components
- Scroll-triggered animations
- Gradient number displays
- Stat cards with glass effect

## 🎣 Custom Hooks

### `useMousePosition`
Tracks mouse position in real-time
```typescript
const { x, y } = useMousePosition();
```

### `useIntersectionObserver`
Detects when elements enter viewport
```typescript
const { targetRef, isIntersecting, hasIntersected } = useIntersectionObserver({
  threshold: 0.1,
  triggerOnce: true
});
```

### `useParallax`
Creates parallax scrolling effect
```typescript
const offset = useParallax(0.3); // speed multiplier
```

### `useScrollPosition`
Tracks current scroll position
```typescript
const scrollPosition = useScrollPosition();
```

## 🎨 Tailwind Classes Used

### Glassmorphism
- `backdrop-blur-xl` - Blur effect
- `bg-white/10` - Semi-transparent white
- `border-white/20` - Semi-transparent border

### Gradients
- `bg-gradient-to-r from-blue-400 to-cyan-400` - Horizontal gradient
- `text-transparent bg-clip-text` - Gradient text

### Animations
- `animate-pulse` - Pulsing animation
- `hover:scale-105` - Scale on hover
- `transition-all duration-300` - Smooth transitions

### Dark Theme
- `bg-slate-900` - Dark background
- `text-white/80` - Semi-transparent text
- `from-slate-900 via-purple-900/20 to-slate-900` - Gradient backgrounds

## 📦 Dependencies

```json
{
  "framer-motion": "^10.16.16",  // Animations
  "next": "14.0.3",               // Framework
  "react": "^18.2.0",             // UI Library
  "tailwindcss": "^3.3.6"         // Styling
}
```

## 🚀 Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the landing page.

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interactions
- Disabled cursor effects on mobile
- Responsive grid layouts
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`

## 🎯 Performance Optimizations

1. **React.memo** - Memoized heavy components
2. **useCallback** - Optimized event handlers
3. **useMemo** - Cached calculations
4. **Intersection Observer** - Lazy animations
5. **Passive event listeners** - Better scroll performance
6. **Conditional rendering** - Mobile vs desktop

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to change theme colors:
```javascript
colors: {
  primary: { ... },
  // Add your custom colors
}
```

### Animation Speed
Modify duration values in component props:
```jsx
transition={{ duration: 0.6, delay: 0.1 }}
```

### Features
Update the `features` array in `LandingPage.tsx`:
```javascript
const features = [
  {
    icon: <YourIcon />,
    title: 'Your Title',
    description: 'Your description'
  }
]
```

## 📄 Pages Structure

- `/` - Landing page (LandingPage component)
- `/login` - Login/Register page
- `/chat` - Main chat interface (requires auth)

## 🎬 Animation Details

- **Entrance Animations**: Fade in + slide up
- **Hover Effects**: Scale, glow, color transitions
- **Scroll Animations**: Triggered on viewport entry
- **Parallax**: Background elements move slower
- **Gradients**: Animated color shifts

## 🎨 Design Principles

1. **Dark Theme** - Modern, professional look
2. **Glassmorphism** - Depth and layering
3. **Gradients** - Dynamic, eye-catching
4. **Smooth Animations** - 60fps performance
5. **Accessibility** - Keyboard navigation support
6. **Mobile First** - Responsive by default

## 🔗 Integration

The landing page integrates with:
- Authentication context
- Next.js routing
- Socket.io (for chat features)
- Toast notifications

## 📝 Notes

- Cursor effects automatically disable on touch devices
- All animations respect `prefers-reduced-motion`
- Components use React hooks for state management
- TypeScript for type safety
- Tailwind CSS for all styling (no custom CSS)

## 🐛 Troubleshooting

### Cursor not showing
- Check if device is touch-enabled (auto-disabled)
- Verify `CustomCursor` is in component tree

### Animations not working
- Ensure Framer Motion is installed
- Check browser console for errors

### Styling issues
- Verify Tailwind config is correct
- Check if classes are being purged

---

Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion

