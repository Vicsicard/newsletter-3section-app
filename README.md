# Newsletter Generator App

## Overview
A modern, full-stack newsletter generation and subscription management application built with Next.js, Supabase, and Brevo. The app uses GPT-3.5-turbo for content generation and provides a seamless workflow for creating and managing newsletters.

## Tech Stack
- Frontend: Next.js 14
- Backend: Supabase
- Email Service: Brevo (Sendinblue)
- AI: OpenAI GPT-3.5-turbo
- Deployment: Vercel

## Features
- [x] Dynamic newsletter generation with AI
- [x] CSV contact import functionality
- [x] Company profile management
- [x] Multi-step onboarding process
- [x] Error-resilient form handling
- [ ] Newsletter preview and editing interface
- [ ] Email campaign management
- [ ] Analytics tracking

## Environment Setup
1. Clone the repository
   ```bash
   git clone [repository-url]
   cd newsletter-3section-app
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   BREVO_API_KEY=your_brevo_key
   BREVO_SENDER_EMAIL=your_brevo_sender_email
   BREVO_SENDER_NAME=your_brevo_sender_name
   BASE_URL=http://localhost:3000
   ```

## Database Setup
1. Create required tables in Supabase:
   - companies
   - contacts
   - newsletters
   - newsletter_sections
   - compiled_newsletters

2. Run the schema migrations:
   ```bash
   cd supabase
   psql -h your_db_host -d your_db_name -U your_db_user -f complete_schema.sql
   ```

## Running the Project
- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## Current Status
- Company creation and management
- Contact CSV import
- AI-powered newsletter generation
- Database schema and API endpoints
- Newsletter editing interface (In Progress)
- Email sending functionality (Pending)

## Deployment
Deployed on Vercel with automatic GitHub integration.

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
