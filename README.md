# Traveloop - Travel Planning Application

A personalized travel planning web application built with modern technologies.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Better Auth
- **State Management**: TanStack Query
- **Animations**: Framer Motion
- **Charts**: Recharts

## Project Structure

```
traveloop/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Authentication routes (login, register)
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── (public)/        # Public routes (shared trips)
│   │   ├── admin/           # Admin dashboard
│   │   └── api/             # API routes
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── forms/          # Form components
│   │   ├── charts/         # Chart components
│   │   ├── navbar/         # Navigation
│   │   └── sidebar/        # Sidebar
│   ├── features/           # Feature-based modules
│   │   ├── auth/           # Authentication
│   │   ├── trips/          # Trip management
│   │   ├── itinerary/      # Itinerary builder
│   │   ├── budget/         # Budget tracking
│   │   ├── packing/        # Packing checklist
│   │   ├── notes/          # Travel journal
│   │   ├── sharing/        # Trip sharing
│   │   ├── profile/        # User profile
│   │   └── admin/          # Admin features
│   ├── lib/                # Core utilities
│   │   ├── actions/        # Server Actions
│   │   ├── services/       # External integrations
│   │   ├── db/             # Database (Prisma)
│   │   ├── utils/          # Utility functions
│   │   ├── constants/      # App constants
│   │   └── validations/    # Zod schemas
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript types
├── prisma/                 # Database schema
├── public/                 # Static assets
└── .env.example           # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database URL and auth secrets

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Push database schema:
   ```bash
   npm run db:push
   ```

6. Run development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database

## Features

- User authentication (login/register)
- Create and manage trips
- Multi-city itinerary builder
- Activity search and planning
- Budget tracking
- Packing checklist
- Travel notes/journal
- Public trip sharing
- User profile management
- Admin analytics dashboard

## Architecture

This project follows:
- Feature-based architecture for scalability
- Route grouping for different layouts
- Server Components by default, Client Components when needed
- Server Actions for data mutations
- Zod schemas for validation

## License

MIT