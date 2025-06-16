# BookaBand Backend

Backend service for the BookaBand platform, a marketplace connecting bands with event organizers.

## Features

- Band management and discovery
- Location-based band filtering using Google Places API
- Event booking and management
- User authentication and authorization
- Band reviews and ratings
- Technical and hospitality rider management

## Tech Stack

- NestJS
- Prisma
- PostgreSQL
- Google Maps Places API
- JWT Authentication

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Google Maps API Key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bookaband?schema=public"

# JWT
JWT_SECRET="your-jwt-secret"

# Google Maps
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Email
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASSWORD="your-email-password"
EMAIL_FROM="noreply@example.com"

# AWS
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-bucket-name"
```

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

3. Set up the database:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run start:dev
```

## Location Filtering

The platform uses Google Places API to provide accurate location-based band filtering. Bands can specify their performance regions using Google Place IDs, which can represent:

- Countries
- Administrative areas (states, regions)
- Provinces
- Cities

When searching for bands by location, the system will:
1. Convert the search location to a Google Place ID
2. Check if the location is within any of the band's supported regions
3. Return only bands that can perform in the requested location

This ensures accurate geographical matching, taking into account administrative hierarchies (e.g., if a band supports "Catalonia", they will be found when searching for "Barcelona").

## API Documentation

API documentation is available at `/api` when running the server.

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
