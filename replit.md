# GreenKarma - Carbon Credit Reward Platform

## Overview

GreenKarma is a mobile-first carbon credit reward platform designed for electric vehicle users, starting with e-rickshaw owners. The application tracks kilometers traveled through odometer image uploads, calculates carbon savings using the Verna formula, and rewards users with carbon credits that can be converted to real money.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Authentication**: Firebase Auth with Google OAuth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
- **File Storage**: Database-backed storage with multer for image uploads
- **API Design**: RESTful endpoints with proper error handling

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation for primary app navigation
- Touch-friendly interface with card-based layouts
- Progressive Web App capabilities

## Key Components

### Authentication System
- Google OAuth integration via Firebase
- Email/password authentication with Firebase
- Redirect-based authentication flow
- Session management with protected routes
- User onboarding flow for new users
- Toggle between sign-in and sign-up modes

### Data Models
- **Users**: Profile information, vehicle type, carbon credits, balance
- **Uploads**: Image metadata, estimated kilometers, carbon calculations, rewards
- **Shared Schema**: Type-safe data validation with Zod

### Image Processing
- File upload handling with 10MB limit
- Image-only filtering for security
- Mock OCR functionality (extracts km from filename for demo)
- Future-ready for real OCR integration

### Reward Calculation
- Verna formula implementation for carbon savings
- Vehicle-specific emission factors
- Automatic credit and monetary reward calculation
- Real-time balance updates

### User Interface
- Dashboard with wallet overview and statistics
- Image upload interface with drag-and-drop
- Transaction history with detailed breakdowns
- Withdrawal interface for credit redemption

## Data Flow

### User Journey
1. **Authentication**: Google OAuth sign-in
2. **Onboarding**: Profile creation with vehicle type selection
3. **Dashboard**: View credits, balance, and upload history
4. **Upload**: Submit odometer images for processing
5. **Processing**: Automatic km extraction and reward calculation
6. **Rewards**: Credit accumulation and balance updates
7. **Withdrawal**: Convert credits to monetary rewards

### API Endpoints
- `GET/POST /api/user` - User profile management
- `POST /api/upload` - Image upload and processing
- `GET /api/uploads/:userId` - Upload history
- `GET /api/stats/:userId` - User statistics
- `POST /api/withdraw` - Withdrawal processing

## External Dependencies

### Third-Party Services
- **Firebase**: Authentication and user management
- **Neon Database**: PostgreSQL hosting (production)
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Hook Form**: Form validation and management

### Development Tools
- **Drizzle Kit**: Database schema management
- **ESBuild**: Production bundling
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Deployment Strategy

### Development Environment
- Hot module replacement via Vite
- TypeScript compilation checking
- Real-time error overlay
- Database schema pushing with Drizzle

### Production Build
- Static asset generation with Vite
- Server bundling with ESBuild
- Environment variable configuration
- Database migration support

### Environment Configuration
- Firebase configuration via environment variables
- Database URL configuration
- Development/production mode switching
- Asset path resolution

### Scalability Considerations
- Stateless server design for horizontal scaling
- Database connection pooling ready
- CDN-ready static asset structure
- Modular component architecture for maintainability

The application is designed as a proof-of-concept with mock OCR functionality, ready for integration with real image processing services when moving to production.