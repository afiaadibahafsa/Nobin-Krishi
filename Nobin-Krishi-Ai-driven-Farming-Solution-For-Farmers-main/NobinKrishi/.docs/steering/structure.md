# Project Structure & Organization

## Root Directory Structure
```
nobinkrishi-main/
├── .kiro/                    # Kiro IDE configuration and steering files
├── public/                   # Static assets (favicon, robots.txt, placeholder images)
├── src/                      # Source code
├── supabase/                 # Supabase configuration
├── node_modules/             # Dependencies
├── package.json              # Project dependencies and scripts
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
├── components.json          # shadcn/ui component configuration
└── postcss.config.js        # PostCSS configuration
```

## Source Code Organization (`/src`)

### Core Application Files
- `main.tsx` - Application entry point with LanguageProvider
- `App.tsx` - Main app component with routing and providers
- `index.css` - Global styles and Tailwind imports
- `App.css` - Additional application styles
- `vite-env.d.ts` - Vite environment type definitions

### Component Architecture (`/src/components`)

#### Feature-Based Component Organization
```
components/
├── ui/                      # Reusable UI components (shadcn/ui)
│   ├── button.tsx          # Base button component
│   ├── card.tsx            # Card layouts
│   ├── form.tsx            # Form components
│   ├── dialog.tsx          # Modal dialogs
│   └── [40+ other UI components]
├── home/                    # Homepage-specific components
│   ├── HeroSection.tsx     # Landing page hero
│   ├── MarketplaceSection.tsx
│   ├── SolutionSection.tsx
│   └── [other home sections]
├── marketplace/             # Marketplace feature components
│   ├── MarketplaceHero.tsx
│   ├── MarketplacePriceCalculator.tsx
│   ├── MarketplaceProducts.tsx
│   └── [other marketplace components]
├── layout/                  # Layout components
│   ├── Navigation.tsx      # Main navigation
│   └── Footer.tsx          # Site footer
└── NavLink.tsx             # Custom navigation link component
```

### Page Components (`/src/pages`)
- `Index.tsx` - Homepage/landing page
- `Marketplace.tsx` - Marketplace page
- `CropGrid.tsx` - Crop knowledge grid
- `VoiceAI.tsx` - Voice AI assistant page
- `Dashboard.tsx` - User dashboard
- `DiseaseScanner.tsx` - Disease scanning feature
- `Weather.tsx` - Weather information page
- `Solutions.tsx` - Solutions overview and detail pages
- `NotFound.tsx` - 404 error page

### Application Logic (`/src`)

#### Context & State Management (`/src/context`)
- `LanguageContext.tsx` - Multi-language support context

#### Custom Hooks (`/src/hooks`)
- `use-mobile.tsx` - Mobile device detection
- `use-toast.ts` - Toast notification hook

#### Utilities (`/src/lib`)
- `utils.ts` - Utility functions (cn for className merging)

#### Backend Integration (`/src/integrations`)
```
integrations/
└── supabase/
    ├── client.ts           # Supabase client configuration
    └── types.ts            # Auto-generated database types
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `HeroSection.tsx`, `MarketplaceHero.tsx`)
- **Pages**: PascalCase (e.g., `Index.tsx`, `Dashboard.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`, `use-mobile.tsx`)
- **Directories**: camelCase for features, lowercase for generic (e.g., `marketplace/`, `ui/`)

### Component Organization Patterns
- **Feature-based grouping**: Components grouped by feature/page (home/, marketplace/)
- **Shared UI components**: Generic reusable components in ui/ folder
- **Layout components**: Navigation and layout-specific components in layout/
- **Page components**: Top-level route components in pages/

## Import Patterns

### Path Aliases
- `@/components` - Component imports
- `@/lib` - Utility functions
- `@/hooks` - Custom hooks
- `@/pages` - Page components
- `@/integrations` - Backend integrations

### Import Organization
```typescript
// External libraries first
import React from 'react';
import { Button } from '@/components/ui/button';

// Internal components
import { HeroSection } from '@/components/home/HeroSection';

// Utilities and hooks
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
```

## Configuration Files

### Build & Development
- `vite.config.ts` - Vite configuration with React SWC, path aliases, and component tagger
- `tsconfig.json` - TypeScript configuration with path mapping and relaxed settings
- `eslint.config.js` - ESLint with React, TypeScript, and React Hooks rules

### Styling & UI
- `tailwind.config.ts` - Comprehensive Tailwind configuration with custom design system
- `components.json` - shadcn/ui configuration for component generation
- `postcss.config.js` - PostCSS configuration for Tailwind processing

### Backend
- `supabase/config.toml` - Supabase project configuration

## Development Workflow

### Adding New Features
1. Create feature-specific component folder in `/src/components/`
2. Add page component in `/src/pages/` if needed
3. Update routing in `App.tsx`
4. Use existing UI components from `/src/components/ui/`
5. Follow TypeScript interfaces for props and data structures

### Component Development
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow Radix UI + shadcn/ui patterns for consistency
- Use Tailwind CSS for styling with custom design tokens
- Implement responsive design with mobile-first approach

### State Management
- Use React Query for server state and API calls
- Use React Context for global application state (language, theme)
- Use local component state for UI-specific state
- Leverage Supabase real-time features for live data updates
