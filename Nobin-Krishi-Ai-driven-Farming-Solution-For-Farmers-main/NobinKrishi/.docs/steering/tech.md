# Technology Stack & Development Guidelines

## Build System & Framework
- **Build Tool**: Vite 5.4+ with SWC for fast compilation
- **Framework**: React 18.3+ with TypeScript 5.8+
- **Routing**: React Router DOM 6.30+ for client-side navigation
- **Package Manager**: npm (package-lock.json present) with Bun support (bun.lockb)

## Frontend Stack
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Component Library**: Radix UI primitives with shadcn/ui components
- **Icons**: Lucide React for consistent iconography
- **Animations**: Tailwind CSS Animate with custom keyframes
- **State Management**: React Query (TanStack Query 5.83+) for server state
- **Forms**: React Hook Form 7.61+ with Zod validation
- **Themes**: next-themes for dark/light mode support

## Backend & Database
- **Backend**: Supabase (PostgreSQL database with real-time features)
- **Authentication**: Supabase Auth with localStorage persistence
- **API Client**: Supabase JS SDK 2.86+
- **Type Safety**: Auto-generated TypeScript types from Supabase schema

## Development Tools
- **Linting**: ESLint 9.32+ with TypeScript ESLint, React Hooks, React Refresh plugins
- **Code Quality**: Strict TypeScript configuration with path aliases (@/*)
- **Development**: Vite dev server on port 8080 with hot reload
- **Component Tagging**: Lovable Tagger for development mode component identification

## Common Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Project Setup
```bash
# Install dependencies
npm install

# Alternative with Bun
bun install
```

## Code Style Guidelines

### TypeScript Configuration
- Use strict TypeScript with relaxed settings for rapid development
- Path aliases configured: `@/*` maps to `./src/*`
- Allow JavaScript files and skip lib checks for faster builds
- Disable unused parameter/variable warnings for development speed

### Component Patterns
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Follow shadcn/ui component patterns for consistency
- Use Radix UI primitives for accessible components

### Styling Conventions
- Use Tailwind CSS utility classes
- Follow custom design system with semantic color tokens
- Implement responsive design with mobile-first approach
- Use CSS custom properties for theme variables

### File Organization
- Components in `/src/components/` with feature-based folders
- Pages in `/src/pages/` for route components
- Utilities in `/src/lib/` for shared functions
- Types and integrations in dedicated folders

## Environment Variables
Required environment variables for Supabase integration:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase anon/public key

## Performance Considerations
- Use React.lazy() for code splitting on routes
- Implement proper loading states with React Query
- Optimize images and use appropriate formats
- Leverage Vite's built-in optimizations for production builds