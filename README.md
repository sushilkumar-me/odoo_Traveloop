<div align="center">

# ✈️ Traveloop

### Your Ultimate AI-Powered Travel Planning Companion

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Plan trips • Build itineraries • Track budgets • Pack smart • Share adventures**

[Live Demo](#) · [Report Bug](https://github.com/sushilkumar-me/odoo_Traveloop/issues) · [Request Feature](https://github.com/sushilkumar-me/odoo_Traveloop/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Routes & Server Actions](#-api-routes--server-actions)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 About

**Traveloop** is a full-stack travel planning platform built for the **Odoo Combat Hackathon**. It empowers travelers to plan end-to-end trips — from creating itineraries and managing day-wise budgets to packing checklists and sharing journeys with the community.

Whether you're planning a solo backpacking trip to Bali or a family vacation to Switzerland, Traveloop provides all the tools you need in one beautiful, responsive dashboard.

---

## ✨ Features

### 🗺️ Trip Planning
- **Create & Manage Trips** — Plan trips with destinations, dates, and descriptions
- **Multi-City Itineraries** — Add multiple cities with day-wise activity scheduling
- **Activity Management** — Organize activities by day with time slots, costs, and categories
- **Popular Destinations** — Quick-start with curated destination suggestions (Bali, Paris, Tokyo, Goa, Dubai, Switzerland)

### 💰 Budget Management
- **Trip-Specific Budgets** — Set budgets per trip with INR (₹) currency support
- **Expense Tracking** — Log expenses with categories and dates
- **Budget Dashboard** — Visual breakdown of spending vs. budget with progress indicators
- **Smart Analytics** — Recharts-powered graphs for financial insights

### 📝 Travel Notes & Journal
- **Rich Note System** — Create notes with categories (hotel, transport, food, emergency, journal)
- **Priority Levels** — Organize notes by low, medium, and high priority
- **Mood Tracking** — Log your mood for journal entries (happy, excited, relaxed, adventurous)
- **Tag System** — Add custom tags for easy filtering and search
- **Archive Support** — Keep your workspace clean by archiving old notes

### 🎒 Smart Packing Checklist
- **Category-Based Packing** — Organize items into Documents, Clothing, Electronics, Toiletries, Medicines, Accessories, Food & Snacks
- **Smart Suggestions** — One-click to add essential travel items automatically
- **Progress Tracking** — Visual progress bar showing packing completion percentage
- **Priority & Essential Markers** — Flag important items so you never forget them
- **Per-Trip Checklists** — Each trip gets its own independent packing list

### 🌐 Community & Sharing
- **Public Trip Sharing** — Share your itineraries via unique links
- **Community Feed** — Discover trips shared by other travelers
- **Like & Bookmark** — Save inspiring trips for future reference
- **Trip Discovery** — Browse popular public itineraries for inspiration

### 🔍 Explore & Discover
- **City Explorer** — Search and browse cities with detailed information
- **Activity Discovery** — Find activities filtered by category, adventure level, and type
- **Destination Database** — Curated database of popular travel destinations

### 👤 User Profile
- **Profile Management** — Update name, bio, phone, city, country, and travel style
- **Personalization** — Set language and currency preferences
- **Travel Statistics** — View your travel history and stats at a glance

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15.1 (App Router) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6.3 |
| **Authentication** | NextAuth.js 4.x (Credentials Provider + bcrypt) |
| **State Management** | TanStack React Query 5 |
| **Animations** | Framer Motion 11 |
| **Charts** | Recharts 2.15 |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |

---

## 🏗️ Architecture

```
Client (React + Next.js App Router)
        │
        ├── Server Components (SSR pages)
        ├── Client Components ("use client")
        │       └── TanStack React Query (data fetching & caching)
        │
        ├── Server Actions ("use server")
        │       └── Prisma ORM → PostgreSQL
        │
        └── API Routes
                └── NextAuth.js (JWT sessions)
```

- **Server Components** handle initial page rendering and authentication checks
- **Client Components** provide interactivity with React Query for real-time data sync
- **Server Actions** handle all database mutations with Zod validation
- **JWT-based sessions** for secure, stateless authentication

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database (local or hosted, e.g., Neon, Supabase, Railway)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sushilkumar-me/odoo_Traveloop.git
   cd odoo_Traveloop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/traveloop"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (GUI) |

---

## 📁 Project Structure

```
odoo_Traveloop/
├── prisma/
│   ├── schema.prisma          # Database schema (12 models)
│   └── seed.ts                # Database seeding script
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Registration page
│   │   │   └── layout.tsx     # Auth layout with animated background
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Main dashboard
│   │   │   │   └── trips/
│   │   │   │       ├── page.tsx       # My Trips listing
│   │   │   │       └── [tripId]/
│   │   │   │           ├── page.tsx           # Trip detail
│   │   │   │           ├── itinerary-view.tsx # Day-wise itinerary
│   │   │   │           ├── itinerary/         # Itinerary builder
│   │   │   │           └── budget/            # Budget dashboard
│   │   │   │
│   │   │   ├── community/     # Community feed & trip sharing
│   │   │   ├── notes/         # Travel notes & journal
│   │   │   ├── packing/       # Packing checklist
│   │   │   ├── profile/       # User profile management
│   │   │   ├── search/        # City & activity explorer
│   │   │   └── layout.tsx     # Dashboard layout with sidebar
│   │   │
│   │   ├── plan-trip/         # Trip creation wizard
│   │   ├── shared/[shareId]/  # Public shared trip view
│   │   ├── api/               # NextAuth API routes
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/
│   │   ├── landing/           # Landing page components
│   │   ├── itinerary/         # Itinerary builder components
│   │   ├── navbar/            # Navigation bar
│   │   ├── sidebar/           # Dashboard sidebar
│   │   ├── providers/         # React Query & Session providers
│   │   └── ui/                # shadcn/ui component library
│   │
│   ├── hooks/                 # Custom React hooks
│   │
│   └── lib/
│       ├── actions/           # Server actions
│       │   ├── trip-actions.ts
│       │   ├── budget-actions.ts
│       │   ├── notes-actions.ts
│       │   ├── packing-actions.ts
│       │   ├── community-actions.ts
│       │   ├── search-actions.ts
│       │   └── profile-actions.ts
│       │
│       ├── auth.ts            # NextAuth configuration
│       └── db.ts              # Prisma client instance
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 🗄️ Database Schema

The application uses **12 interconnected Prisma models**:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────▸│   Trip   │────▸│   City   │
│          │     │          │     │          │
│ • name   │     │ • name   │     │ • name   │
│ • email  │     │ • dates  │     │ • dates  │
│ • bio    │     │ • public │     │ • order  │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     │                │                │
     ▼                ▼                ▼
┌──────────┐   ┌──────────┐    ┌──────────┐
│  Budget  │   │ Packing  │    │ Activity │
│          │   │  Item    │    │          │
│ • amount │   │ • packed │    │ • cost   │
│ • trips  │   │ • categ. │    │ • date   │
└──────────┘   └──────────┘    └──────────┘
     │
     ▼
┌──────────┐   ┌──────────┐    ┌──────────┐
│ Expense  │   │   Note   │    │ TripLike │
│          │   │          │    │          │
│ • amount │   │ • mood   │    │ • userId │
│ • categ. │   │ • tags   │    │ • tripId │
└──────────┘   └──────────┘    └──────────┘
```

**Key Models:** `User`, `Trip`, `City`, `Activity`, `Note`, `PackingItem`, `Budget`, `Expense`, `Destination`, `TripLike`, `TripBookmark`, `UserPreferences`

---

## 🔌 API Routes & Server Actions

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | NextAuth.js handler |
| `/api/auth/session` | GET | Get current session |

### Server Actions

| Action File | Functions |
|------------|-----------|
| `trip-actions.ts` | `createTrip`, `updateTrip`, `deleteTrip`, `togglePublic`, `generateShareId` |
| `budget-actions.ts` | `createBudget`, `addExpense`, `deleteExpense`, `getBudgetData` |
| `notes-actions.ts` | `createNote`, `updateNote`, `deleteNote`, `archiveNote`, `getNotes` |
| `packing-actions.ts` | `createPackingItem`, `togglePacked`, `resetChecklist`, `addSuggestedItems` |
| `community-actions.ts` | `getPublicTrips`, `likeTrip`, `bookmarkTrip` |
| `search-actions.ts` | `searchCities`, `searchActivities`, `getDestinations` |
| `profile-actions.ts` | `updateProfile`, `updatePreferences`, `changePassword` |

---

## 📸 Screenshots

<div align="center">

| Dashboard | Plan Trip |
|-----------|-----------|
| Main dashboard with trip stats, regional selections, and quick actions | Trip creation wizard with popular destination suggestions |

| My Trips | Itinerary Builder |
|----------|-------------------|
| Trip listing with status badges, budget info, and cover images | Day-wise activity management with drag & drop |

| Budget Tracker | Packing Checklist |
|---------------|-------------------|
| Visual expense tracking with category breakdown charts | Smart packing with category-based organization |

| Community Feed | Notes & Journal |
|---------------|-----------------|
| Discover and bookmark public trips from other travelers | Rich notes with mood tracking, tags, and priorities |

</div>

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 👥 Team

Built with ❤️ for the **Odoo Combat Hackathon** by:

- **Sushil Kumar** — [@sushilkumar-me](https://github.com/sushilkumar-me)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If you found this project helpful, give it a star!**

Made with Next.js, TypeScript, and a love for travel ✈️

</div>
