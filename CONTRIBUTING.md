# Contributing to KonfiDay Planer

Thank you for considering contributing to KonfiDay Planer! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a positive environment

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/KonfiDayPlaner.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Setting Up

```bash
npm install
npm run dev
```

### 2. Making Changes

- Follow the existing code style
- Use TypeScript types properly
- Keep components small and focused
- Add comments for complex logic

### 3. Code Style

#### TypeScript
- Use explicit types over `any`
- Prefer interfaces for object shapes
- Use type aliases for unions

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

// ❌ Avoid
const user: any = { id: '1', name: 'John' };
```

#### Components
- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep JSX readable and well-formatted

```typescript
// ✅ Good
function MyComponent({ title }: { title: string }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
}

export default MyComponent;
```

#### File Organization
- Place components in appropriate subdirectories
- Update barrel exports (`index.ts`) when adding files
- Keep related files together

```
components/
  forms/
    NewForm.tsx
    index.ts  # Don't forget to export!
```

### 4. Commit Messages

Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Add user authentication service"
git commit -m "Fix clock display timezone issue"
git commit -m "Update README with new setup instructions"

# ❌ Avoid
git commit -m "fix"
git commit -m "updates"
git commit -m "wip"
```

### 5. Testing

Before submitting:

```bash
npm run lint        # Check for linting errors
npm run build      # Ensure build works
```

### 6. Pull Requests

1. Update your branch with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - List of changes made

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z component

## Testing
- [ ] Code builds without errors
- [ ] Linting passes
- [ ] Tested in browser

## Screenshots (if applicable)
```

## Project Structure

See [STRUCTURE.md](./STRUCTURE.md) for detailed information about the project organization.

### Adding New Features

#### New Component
1. Create component in appropriate directory
2. Add to `index.ts` barrel export
3. Import using barrel export in other files

#### New Page
1. Add page component to `/src/pages`
2. Export from `/src/pages/index.ts`
3. Add route in `App.tsx`

#### New Type
1. Add to `/src/types`
2. Export from `/src/types/index.ts`

#### New Utility
1. Add to `/src/utils`
2. Export from `/src/utils/index.ts`
3. Add JSDoc comments

## Common Tasks

### Adding a New Route

1. Create page component in `/src/pages`:
```typescript
// src/pages/NewPage.tsx
function NewPage() {
  return <div>New Page</div>;
}

export default NewPage;
```

2. Export from pages index:
```typescript
// src/pages/index.ts
export { default as NewPage } from './NewPage';
```

3. Add route in App.tsx:
```typescript
import { NewPage } from './pages';

<Route path="/new" element={<NewPage />} />
```

### Adding a Custom Hook

1. Create hook in `/src/hooks`:
```typescript
// src/hooks/useMyHook.ts
export function useMyHook() {
  // Hook logic
  return { /* ... */ };
}
```

2. Export from hooks index:
```typescript
// src/hooks/index.ts
export { useMyHook } from './useMyHook';
```

### Adding a Type

1. Create or update type file:
```typescript
// src/types/myType.ts
export interface MyType {
  id: string;
  name: string;
}
```

2. Export from types index:
```typescript
// src/types/index.ts
export * from './myType';
```

## Questions?

Open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
