# AI Ecosystem Rolodex

## Overview

AI Ecosystem Rolodex is a modern web application for organizing and accessing AI tools and applications. It provides a centralized hub with a card-based dashboard for cataloging various AI tools, featuring categorization, filtering, search functionality, and CRUD operations. The application follows an Apple/Mac-inspired aesthetic with a professional, clean UI design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Styling**: TailwindCSS with a custom theme system supporting light/dark modes
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **State Management**: TanStack React Query for server state, React Context for auth and theme
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth transitions and micro-interactions

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful endpoints under `/api/` prefix
- **Authentication**: JWT-based auth with httpOnly cookies, plus SAML SSO via SSOReady
- **Validation**: Zod schemas shared between frontend and backend

### Data Layer
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Connection**: Pool-based with retry logic and exponential backoff

### Key Design Decisions

1. **Shared Schema Pattern**: The `shared/schema.ts` file contains Drizzle table definitions and Zod validation schemas used by both client and server, ensuring type consistency across the stack.

2. **Storage Abstraction**: The `IStorage` interface in `server/storage.ts` abstracts database operations, making it easier to swap implementations or add caching.

3. **AI Integration**: xAI (Grok) integration via server-side endpoints for tool suggestions, auto-categorization, and tag generation.

4. **Protected Routes**: Admin functionality requires authentication; public view is read-only.

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres database connected via `DATABASE_URL` environment variable

### Authentication Services
- **JWT**: Token-based authentication using `jsonwebtoken` package with httpOnly secure cookies
- **bcrypt**: Password hashing for local authentication (password stored hashed in database)
- **SSOReady**: SAML SSO integration for enterprise authentication via `SSOREADY_API_KEY`

### Security Architecture
- All JWT tokens stored in httpOnly cookies (not accessible via JavaScript)
- `secure` flag enabled for cookies in production environments
- No token storage in localStorage or exposure to frontend
- Auth verification via `/api/auth/verify` endpoint
- All mutating API endpoints protected by `isAuthenticated` middleware
- Default admin user seeded on first run (admin/admin123) - should be changed in production

### AI Services
- **xAI (Grok)**: AI-powered features (suggestions, categorization, tagging) via `XAI_API_KEY` environment variable

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `JWT_SECRET`: Secret key for JWT signing (required for auth)
- `XAI_API_KEY`: xAI API key for AI features (optional)
- `SSOREADY_API_KEY`: SSOReady API key for SAML SSO (optional)