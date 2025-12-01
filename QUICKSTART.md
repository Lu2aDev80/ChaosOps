# Quick Reference Guide

## Project Commands

```bash
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## Directory Quick Reference

| Directory | Purpose | Example Files |
|-----------|---------|---------------|
| `src/components/forms/` | Form components | DayPlanForm, EventForm |
| `src/components/layout/` | Layout wrappers | FlipchartBackground, ResponsiveContainer |
| `src/components/planner/` | Schedule components | Clock, Planer, ScheduleCard |
| `src/components/ui/` | UI components | OrganisationCard |
| `src/constants/` | App configuration | appConfig.ts |
| `src/data/` | Static/mock data | organisations.ts |
| `src/hooks/` | Custom hooks | useAutoCenter, useClock |
| `src/pages/` | Page components | Home, Admin, Dashboard |
| `src/services/` | API services | (Future API calls) |
| `src/types/` | TypeScript types | event.ts, schedule.ts |
| `src/utils/` | Utility functions | dateTime.ts |

## Import Patterns

```typescript
// Components
import { DayPlanForm, EventForm } from '@/components/forms';
import { FlipchartBackground } from '@/components/layout';
import { Clock, Planer } from '@/components/planner';

// Hooks
import { useAutoCenter, useClock } from '@/hooks';

// Types
import { Event, DayPlan, ScheduleItem } from '@/types';

// Utils
import { formatDate, formatTime } from '@/utils';

// Constants
import { appConfig } from '@/constants';

// Data
import { organisations } from '@/data';
```

## Common Tasks

### Add New Component

1. Create component file in appropriate directory
2. Add export to directory's `index.ts`
3. Use barrel import elsewhere

```typescript
// 1. Create src/components/ui/Button.tsx
export default function Button() { /* ... */ }

// 2. Update src/components/ui/index.ts
export { default as Button } from './Button';

// 3. Import elsewhere
import { Button } from '@/components/ui';
```

### Add New Page

1. Create page in `src/pages/`
2. Export from `src/pages/index.ts`
3. Add route in `App.tsx`

```typescript
// 1. Create src/pages/NewPage.tsx
export default function NewPage() { /* ... */ }

// 2. Update src/pages/index.ts
export { default as NewPage } from './NewPage';

// 3. Update App.tsx
import { NewPage } from './pages';
<Route path="/new" element={<NewPage />} />
```

### Add New Type

1. Add to existing file in `src/types/` or create new
2. Export from `src/types/index.ts`

```typescript
// 1. Add to src/types/user.ts
export interface User {
  id: string;
  name: string;
}

// 2. Update src/types/index.ts
export * from './user';

// 3. Use anywhere
import { User } from '@/types';
```

### Add New Utility Function

1. Add to `src/utils/` (existing or new file)
2. Export from `src/utils/index.ts`

```typescript
// 1. Add to src/utils/string.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 2. Update src/utils/index.ts
export * from './string';

// 3. Use anywhere
import { capitalize } from '@/utils';
```

## Code Style Quick Tips

### TypeScript
```typescript
// ✅ Use explicit types
interface Props {
  title: string;
  count: number;
}

// ❌ Avoid any
const data: any = {};
```

### Components
```typescript
// ✅ Functional components with types
function MyComponent({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

// ✅ Extract complex logic to hooks
function useMyLogic() {
  // Complex logic here
  return { /* ... */ };
}
```

### Imports
```typescript
// ✅ Use barrel exports
import { Clock, Planer } from '@/components/planner';

// ❌ Avoid direct file imports
import Clock from '@/components/planner/Clock';
import Planer from '@/components/planner/Planer';
```

## Git Workflow

```bash
# Start new feature
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add: description of changes"

# Push and create PR
git push origin feature/my-feature
```

## Useful VSCode Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

## Docker Quick Commands

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild
docker-compose up -d --build
```

## Debugging Tips

1. **Dev Server Issues**: Check port 5173 is not in use
2. **Build Errors**: Run `npm run lint` first
3. **Import Errors**: Check barrel exports in `index.ts` files
4. **Type Errors**: Verify types are exported from `src/types/`

## Resources

- [README.md](./README.md) - Full project documentation
- [STRUCTURE.md](./STRUCTURE.md) - Detailed structure guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
