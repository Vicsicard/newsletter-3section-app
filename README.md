# Newsletter Generator App

## Overview
A modern, full-stack newsletter generation and subscription management application built with Next.js, Supabase, and Brevo.

## Tech Stack
- Frontend: Next.js 14
- Backend: Supabase
- Email Service: Brevo (Sendinblue)
- Deployment: Vercel

## Features
- Dynamic newsletter generation
- Email subscription management
- Transactional email sending
- Error-resilient email integration

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
   BREVO_API_KEY=your_brevo_key
   BREVO_SENDER_EMAIL=your_brevo_sender_email
   BREVO_SENDER_NAME=your_brevo_sender_name
   BASE_URL=http://localhost:3000
   ```

## Running the Project
- Development: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## Deployment
Deployed on Vercel with automatic GitHub integration

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
