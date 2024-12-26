# Newsletter Generator App

## Overview
A modern, full-stack newsletter generation and subscription management application built with Next.js, Supabase, and Brevo. The app uses GPT-3.5-turbo for content generation and DALL-E 3 for image generation, providing a seamless workflow for creating and managing newsletters.

## Process Flow
1. **Company Onboarding**
   - Collect company information
   - Import contact list via CSV
   - Store data in Supabase

2. **Industry Analysis**
   - Generate comprehensive industry summary using GPT-3.5
   - Analyze current trends and challenges
   - Store analysis for content generation

3. **Newsletter Generation**
   - Create three distinct sections:
     1. Industry Insights
     2. Best Practices
     3. Success Stories
   - Generate section-specific images using DALL-E 3
   - Store complete newsletter in Supabase

4. **Newsletter Management**
   - Preview generated content
   - Edit and customize sections
   - Approve or regenerate content

5. **Email Distribution**
   - Set up email campaigns via Brevo
   - Schedule newsletter delivery
   - Track engagement metrics

## Tech Stack
- Frontend: Next.js 14
- Backend: Supabase
- Email Service: Brevo (Sendinblue)
- AI: OpenAI GPT-3.5-turbo & DALL-E 3
- Deployment: Vercel

## Features
- [x] Dynamic newsletter generation with AI
- [x] CSV contact import functionality
- [x] Company profile management
- [x] Multi-step onboarding process
- [x] Error-resilient form handling
- [x] Industry analysis generation
- [x] Three-section newsletter structure
- [x] AI-powered image generation
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

## ⚠️ Important Development Guidelines

> **WARNING**: This application follows a carefully planned architecture and workflow. Before making any changes:
> 1. Review the Process Flow section in this README
> 2. Check the detailed implementation phases in PROJECT_STATUS.md
> 3. Ensure changes align with the existing architecture
> 4. DO NOT delete or modify core files without consulting these documents
> 5. Any changes to the database schema must follow the established patterns

The success of this application relies on maintaining consistency with this documented approach. Each component has been designed to work together in a specific way.

## Documentation
- [Project Status](PROJECT_STATUS.md) - Current status and implementation phases
- [Architecture](ARCHITECTURE.md) - Detailed technical documentation and best practices
- [API Documentation](API.md) - API endpoints and usage

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
