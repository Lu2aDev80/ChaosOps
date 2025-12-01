# KonfiDay Planer

A modern web application for managing and displaying schedules for Konfi Day events. Built with React, TypeScript, and Vite.

## Features

- 📅 **Event Planning**: Create and manage day plans with multiple events
- 🎯 **Schedule Display**: Visual schedule cards with real-time updates
- ⏰ **Live Clock**: Built-in clock with auto-centering on current events
- 🏢 **Multi-Organisation**: Support for multiple organizations
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Flipchart UI**: Unique flipchart-style background design

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM 7
- **Icons**: Lucide React
- **Deployment**: Docker with Nginx

## Project Structure

```
KonfiDayPlaner/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # React components
│   │   ├── forms/      # Form components
│   │   ├── layout/     # Layout components
│   │   ├── planner/    # Planner-specific components
│   │   └── ui/         # UI components
│   ├── constants/      # Application constants
│   ├── data/          # Static data and mock data
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services (future)
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main App component
│   └── main.tsx       # Application entry point
├── docker-compose.yml  # Docker composition
├── Dockerfile         # Docker configuration
├── nginx.conf         # Nginx configuration
└── vite.config.ts     # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lu2aDev80/KonfiDayPlaner.git
cd KonfiDayPlaner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Docker Deployment

```bash
docker-compose up -d
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Code Organization

### Barrel Exports

The project uses barrel exports (index.ts files) for cleaner imports:

```typescript
// Instead of:
import { Clock } from './components/planner/Clock';
import { Planer } from './components/planner/Planer';

// You can use:
import { Clock, Planer } from './components/planner';
```

### Component Structure

- **forms/**: Form components for data input
- **layout/**: Layout and wrapper components
- **planner/**: Schedule and planner-specific components
- **ui/**: Reusable UI components
- **pages/**: Top-level page components

### Directory Purpose

- **constants/**: Application-wide configuration and constants
- **data/**: Static data, mock data, and data models
- **hooks/**: Custom React hooks for reusable logic
- **services/**: API services and business logic (for future backend integration)
- **types/**: TypeScript type definitions and interfaces
- **utils/**: Helper functions (date formatting, validation, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is private and proprietary.

## Authors

- Lu2aDev80

## Acknowledgments

Built for managing Konfi Day events efficiently.
