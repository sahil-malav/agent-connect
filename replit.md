# Agent Portal

## Overview

This is a full-stack agent management portal built with React, Express, and PostgreSQL. The application provides a unified platform for managing AI agents, monitoring their performance, and facilitating real-time interactions. It features a modern dashboard interface where users can view agent status, test agent capabilities through interactive demos, and monitor system metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 21, 2025**
- **AI Agent Theory Categorization**: Complete migration from business categories to AI agent theory taxonomy
  - Updated agent type dropdown with: Simple reflex agents, Model-based agents, Goal-based agents, Utility-based agents, Learning agents, Hierarchical agents
  - Enhanced agent response simulation with contextual AI theory-based responses reflecting agent capabilities
  - Updated dashboard AGENT TYPES section to display new categories with proper counts
  - Migrated all sample data to use new agent type classifications
- **WebSocket Demo Functionality**: Successfully implemented real-time agent message exchange system
- Fixed infinite connection loop issues that were causing WebSocket spam
- Enhanced agent response simulation with contextual, capability-based replies
- Added comprehensive debugging and error handling for WebSocket communications
- Implemented proper connection state management to prevent re-connection loops
- Added response time tracking and session metrics in demo interface
- **Agent Response Intelligence**: Agents now provide contextual responses based on their specific capabilities and AI agent theory classification
- **Keyword-based Response System**: Intelligent response selection based on message content (refunds, issues, orders, greetings)

**August 20, 2025**
- Enhanced agent registration form with comprehensive tech stack capture
- Added Technology Stack input field for comma-separated tech entries
- Added Capabilities input field for agent abilities
- Implemented proper backend processing to convert arrays to storage format
- Fixed TypeScript errors in storage layer
- Added activity logging for tech stack information in agent registration
- Applied UST corporate branding with purple and teal color palette
- Implemented Source Sans Pro typography for enterprise styling
- **Browser Optimization**: Added Chrome and Safari specific optimizations including hardware acceleration, smooth scrolling, and font smoothing
- **Font Size Enhancement**: Increased base font sizes across the application for better readability (16px base, larger headings and text sizes)
- **Performance Improvements**: Added critical CSS, font preloading, DNS prefetch, and hardware-accelerated animations for better user experience

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui for accessible, customizable components
- **Styling**: Tailwind CSS with a custom design system using CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket integration for live agent interactions

### Backend Architecture
- **Framework**: Express.js with TypeScript for type-safe server development
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development Setup**: Hot reload with Vite middleware integration
- **Error Handling**: Centralized error handling with structured logging

### Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Fallback Storage**: In-memory storage implementation for development/testing

### Database Schema Design
The system uses four main entities:
- **Agents**: Core agent information including metadata, status, and capabilities
- **Interactions**: Message exchanges between users and agents with performance metrics
- **System Metrics**: Infrastructure monitoring data (uptime, response times, success rates)
- **Activity Logs**: Audit trail for system events and agent activities

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Security**: Built-in CORS handling and request validation
- **Development Mode**: Simplified authentication for development environment

### Real-time Features
- **WebSocket Server**: Integrated WebSocket server for bidirectional communication
- **Agent Communication**: Real-time message exchange with agents
- **Status Updates**: Live agent status monitoring and updates
- **Performance Tracking**: Real-time response time and success rate monitoring

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL with Neon serverless hosting
- **UI Components**: Radix UI primitives for accessibility
- **WebSocket**: ws library for real-time communication
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production bundling
- **Development**: tsx for TypeScript execution in development

### Cloud Services
- **Database Hosting**: Neon Database for serverless PostgreSQL
- **Deployment**: Configured for Replit hosting environment
- **Session Storage**: PostgreSQL-backed session management

### Monitoring and Logging
- **Request Logging**: Custom middleware for API request tracking
- **Performance Monitoring**: Built-in response time and success rate tracking
- **Error Tracking**: Centralized error handling and logging system