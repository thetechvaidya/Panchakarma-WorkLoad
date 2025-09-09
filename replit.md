# Panchkarma Workload Distributor

## Overview
A React-based web application designed for managing and distributing workload among scholars in a Panchkarma medical department. The application allows for patient registration, scholar management, and optimal workload distribution with data persistence via Firebase.

## Project Status
- **Current State**: Fully functional and running on Replit
- **Last Updated**: September 09, 2025
- **Environment**: Production-ready

## Recent Changes
- **2025-09-09**: Successfully imported and configured for Replit environment
  - Installed Node.js 20 and all required dependencies
  - Added React TypeScript types (@types/react, @types/react-dom)
  - Configured Vite for Replit proxy compatibility (host: 0.0.0.0, port: 5000)
  - Added @vitejs/plugin-react for proper React support
  - Fixed TypeScript configuration with Vite client types
  - Set up development workflow on port 5000
  - Configured deployment for autoscale with build and preview commands

## Project Architecture

### Frontend Framework
- **React 19.1.1** with TypeScript
- **Vite 6.2.0** as build tool and dev server
- **Tailwind CSS** for styling via CDN
- **Font Awesome** icons via CDN

### Backend Services
- **Firebase Firestore** for data persistence
- **Firebase configuration** with environment variable support

### Key Components
- `App.tsx` - Main application component with state management
- `components/` - Modular React components for UI
- `services/` - Business logic services (distribution, export, history, parser)
- `firebaseConfig.ts` - Firebase initialization and configuration

### Development Setup
- **Dev Server**: Runs on 0.0.0.0:5000 for Replit compatibility
- **Build Tool**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Hot Module Replacement**: Configured for Replit proxy

### Deployment
- **Target**: Autoscale deployment suitable for stateless web apps
- **Build Command**: `npm run build`
- **Run Command**: `npm run preview`
- **Production Ready**: Yes

## User Preferences
- Clean, professional medical interface
- Responsive design for various screen sizes
- Real-time data persistence
- Historical data viewing capabilities
- Export functionality for assignments

## Development Workflow
1. Frontend server runs automatically on port 5000
2. Changes are hot-reloaded via Vite
3. TypeScript compilation with strict typing
4. Firebase integration for data persistence
5. Ready for production deployment