# Will It Rain On My Parade?

A weather risk dashboard that helps users check rain probability and heat risk for their upcoming events.

## Features
hehe
- **Location Search**: Enter a city name or use manual coordinates
- **Date Selection**: Choose any date within the next 14 days
- **Risk Analysis**:
  - Rain probability with color-coded risk levels
  - Heat risk based on maximum temperature
  - Visual indicators using emojis and badges
- **Real-time Weather Data**: Powered by Open-Meteo API
- **Data Persistence**: Stores query history in Supabase database

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Weather API**: Open-Meteo (free, no API key required)
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/       # React components
│   ├── LocationInput.tsx
│   ├── DatePicker.tsx
│   ├── ResultsCard.tsx
│   ├── LoadingSpinner.tsx
│   └── RiskBadge.tsx
├── services/        # API services
│   └── forecastService.ts
├── lib/             # Utilities
│   └── supabase.ts
├── types.ts         # TypeScript types
└── App.tsx          # Main app component

supabase/
├── functions/       # Edge functions
│   └── forecast/
│       └── index.ts
└── migrations/      # Database migrations
    └── 001_create_forecast_tables.sql
```

## Risk Levels

### Rain Risk
- **Low**: < 30% chance of rain
- **Medium**: 30-59% chance of rain
- **High**: ≥ 60% chance of rain

### Heat Risk
- **Low**: < 80°F (< 27°C)
- **Medium**: 80-89°F (27-31°C)
- **High**: ≥ 90°F (≥ 32°C)

## Database Schema

The app uses two main tables:

1. **forecast_queries**: Stores user queries and results for analytics
2. **forecast_cache**: Caches API responses to reduce external API calls

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

The following environment variables are configured in `.env`:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
