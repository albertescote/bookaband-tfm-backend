# BookaBand Backend

This repository contains the backend service for BookaBand, a web platform that streamlines the process of hiring musicians and bands for all types of events. The system acts as a central meeting point between artists and clients, supporting the entire booking workflow—from discovery and communication to contracting, payment, and logistical coordination.

## Project Context

This backend system is developed as part of a Master's Thesis for the *Master in Software Engineering and Computer Systems at UNIR (Universidad Internacional de La Rioja)*.

## Key Features

- **Musician and Band Profile Management**: Artists can create and manage professional profiles with media, descriptions, and availability.
- **Advanced Search and Filtering**: Clients can discover bands using filters such as artistName, location, and availability, with support for location-based queries via the Google Places API.
- **Event Booking System**: Complete support for booking flow, including date selection, contract terms, and pricing negotiation.
- **Contract Management with Digital Signature**: Contracts between clients and musicians are generated and signed digitally for legal validity and convenience.
- **User Authentication and Authorization**: Secure access control using JWT and role-based permissions. Google federated authentication also supported.
- **Review and Rating System**: Clients can leave feedback and ratings for bands after events.
- **Rider Management**: Bands can define and update their technical and hospitality requirements for each event.
- **Real-Time Chat**: Integrated messaging system to enable direct communication between clients and artists during the negotiation and planning phase.
- **Notification System**: Email or in-app notifications are used to keep users informed about booking updates, messages, contract changes, and more.

## Tech Stack

* **NestJS** – Progressive Node.js framework for building efficient, scalable server-side applications using TypeScript.
* **TypeScript** – Typed JavaScript superset providing better tooling and maintainability.
* **Prisma ORM** – Type-safe database toolkit for PostgreSQL with schema modeling and migration capabilities.
* **PostgreSQL** – Relational database for structured and transactional data.
* **MongoDB** – NoSQL database for unstructured data, e.g., chat messages.
* **Redis** – In-memory store used for caching and pub/sub patterns.
* **Passport.js** – Modular authentication middleware supporting strategies like local and JWT.
* **JWT & JOSE** – Token-based authentication and secure identity exchange.
* **Socket.IO** – Real-time WebSocket communication, used in features like chat or live updates.
* **Multer** – Middleware for handling multipart/form-data (file uploads).
* **PDF-lib** – Library to generate and edit PDF files (e.g., for contract generation).
* **Axios** – HTTP client for external API calls.
* **Resend** – Transactional email service for notifications.
* **Class-validator & Class-transformer** – Declarative data validation and transformation.
* **Date-fns-tz & Moment-Timezone** – Libraries for robust date/time and timezone handling.
* **ioredis** – High-performance Redis client for Node.js.
* **Jest** – JavaScript testing framework with support for unit, integration, and e2e testing.
* **ESLint & Prettier** – Code quality enforcement and formatting.

## Prerequisites

- Node.js (v22 or higher)
- Google Maps API Key
- Google OAuth Client Credentials
- Resend API Key
- VIDSigner Credentials

## Environment Variables

Create a `.env` file in the root directory with the variables that appear in .env.example.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bookaband-tfm-backend.git
cd bookaband-tfm-backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the databases: PostgreSQL, MongoDB & Redis
```bash
docker-compose up -d
```

4. Set up the PostgreSQL
```bash
# Prisma
npm run db-generate-modules

npm run db-post-schema

# Seed
npm run db-primsa-seed
```

4. Start the server:
```bash
npm run start
```

## Testing

Run the test suite:
```bash
# All tests
npm run test

# Unit tests
npm run test:unit

# Integration tests (To run integration tests, it is necessary to clean the databases. To do this, you can run db-prism-clear)
npm run test:integration
```
