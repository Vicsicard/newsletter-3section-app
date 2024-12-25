# Newsletter Generation App

A Next.js application that helps businesses create personalized newsletters using AI. The app features a multi-step onboarding form, contact CSV import, and AI-powered newsletter generation.

## Features

- Multi-step onboarding form for collecting company information
- CSV contact import functionality
- Logo upload with image processing
- AI-powered industry insights generation using GPT-4
- Automated 3-section newsletter creation
- Supabase integration for data storage

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4
- **File Storage**: Supabase Storage
- **Image Processing**: Sharp

## Environment Variables

Create a `.env.local` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
BASE_URL=http://localhost:3001
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Initialize Supabase tables:
   - Run the SQL scripts in `/supabase/schema.sql`
   - Run the SQL scripts in `/supabase/add_gpt_tables.sql`
5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:
- `companies`: Store company information
- `contacts`: Store imported contacts
- `industry_insights`: Store AI-generated industry insights
- `newsletters`: Track newsletter metadata
- `newsletter_sections`: Store the three sections of each newsletter

## API Endpoints

- `/api/onboarding`: Handle company registration and contact import
- `/api/generate-newsletter`: Generate industry insights and newsletter content

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
