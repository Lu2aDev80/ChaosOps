# Project Structure Documentation

## Directory Organization

### `/src` - Source Code
Main application source code directory.

#### `/src/assets`
Static assets like images, fonts, and other media files.

#### `/src/components`
Reusable React components organized by category:

- **`/forms`** - Form components (DayPlanForm, EventForm, LoginForm)
- **`/layout`** - Layout wrapper components (FlipchartBackground, ResponsiveContainer)
- **`/planner`** - Schedule/planner-specific components (Clock, Planer, ScheduleCard, ScheduleManager)
- **`/ui`** - General UI components (OrganisationCard)

Each subdirectory contains an `index.ts` barrel export for cleaner imports.

#### `/src/constants`
Application-wide configuration and constant values:
- `appConfig.ts` - Application configuration (locale, defaults)

#### `/src/data`
Static data and mock data:
- `organisations.ts` - Organization data and types

#### `/src/hooks`
Custom React hooks for shared logic:
- `useAutoCenter.ts` - Auto-centering logic for schedule view
- `useClock.ts` - Clock state management

#### `/src/pages`
Top-level page components mapped to routes:
- `Admin.tsx` - Admin layout page
- `Dashboard.tsx` - Dashboard page
- `DisplayRegister.tsx` - Display registration page
- `Documentation.tsx` - Documentation page
- `Home.tsx` - Home page
- `OrganisationSelect.tsx` - Organization selection page
- `PlannerPage.tsx` - Main planner view

#### `/src/services`
API services and business logic layer (for future backend integration).
Currently empty - ready for API service implementations.

#### `/src/styles`
Global CSS and style definitions:
- `Colors.css` - Color scheme definitions

#### `/src/types`
TypeScript type definitions and interfaces:
- `event.ts` - Event and DayPlan types
- `schedule.ts` - Schedule item types (Session, Workshop, Break, etc.)

#### `/src/utils`
Utility functions and helpers:
- `dateTime.ts` - Date/time formatting and manipulation utilities

## Root Level Files

### Configuration Files
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration (main)
- `tsconfig.app.json` - TypeScript configuration for app code
- `tsconfig.node.json` - TypeScript configuration for Node.js tools
- `eslint.config.js` - ESLint configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

### Docker Files
- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose orchestration
- `nginx.conf` - Nginx web server configuration
- `web.config` - IIS web server configuration

### Project Files
- `package.json` - NPM dependencies and scripts
- `index.html` - HTML entry point
- `README.md` - Project documentation
- `.env.example` - Environment variables template

## Import Patterns

### Barrel Exports
Use barrel exports for cleaner imports:

```typescript
// ✅ Good - Using barrel export
import { Clock, Planer } from '@/components/planner';
import { useAutoCenter, useClock } from '@/hooks';
import { Event, DayPlan } from '@/types';

// ❌ Avoid - Direct file imports
import { Clock } from '@/components/planner/Clock';
import { Planer } from '@/components/planner/Planer';
```

### Path Aliases
Configure in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': '/src',
  }
}
```

## Code Organization Best Practices

### Components
- Keep components focused and single-responsibility
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Keep component files under 300 lines

### Types
- Define types in `/src/types`
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Export types alongside implementation when appropriate

### Utilities
- Pure functions with clear input/output
- Well-documented with JSDoc comments
- Unit testable
- One responsibility per function

### Services
- Encapsulate API calls and business logic
- Use async/await for asynchronous operations
- Handle errors consistently
- Return typed responses

## Adding New Features

1. **New Component**: Add to appropriate `/components` subdirectory, update `index.ts`
2. **New Page**: Add to `/pages`, update `App.tsx` routes, update `index.ts`
3. **New Type**: Add to `/types`, export from `index.ts`
4. **New Hook**: Add to `/hooks`, export from `index.ts`
5. **New Utility**: Add to `/utils`, export from `index.ts`
6. **New Service**: Add to `/services`, export from `index.ts`

## Maintenance Guidelines

- Keep barrel exports updated when adding/removing files
- Document complex logic with comments
- Follow existing naming conventions
- Run `npm run lint` before committing
- Keep dependencies up to date
