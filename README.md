# AI-Powered Newsletter Generator

A powerful newsletter generation system built with Next.js, OpenAI, and Supabase. Generate professional newsletters with AI-powered content and images.

## Features

- 🤖 AI-powered content generation using GPT-3.5-turbo
- 🎨 Professional images using DALL-E 3
- 📊 Industry-specific insights and trends
- 📧 Direct email delivery via Brevo
- 📁 Contact list management
- 🔒 Secure API handling

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **AI**: OpenAI (GPT-3.5-turbo, DALL-E 3)
- **Email**: Brevo API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   BREVO_API_KEY=your_brevo_key
   BREVO_SENDER_EMAIL=your_sender_email
   BREVO_SENDER_NAME=your_sender_name
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Fill out the onboarding form with your company details
2. Upload your contact list (CSV format)
3. Click "Generate Newsletter" to create AI-powered content
4. Review and send your newsletter

## API Endpoints

- `/api/onboarding`: Handle company registration and contact import
- `/api/newsletter/generate`: Generate newsletter content with AI
- `/api/newsletter/send`: Send newsletter via Brevo
- `/api/newsletter/[id]`: Retrieve newsletter by ID

## Security

- All sensitive operations are handled server-side
- API keys are securely stored in environment variables
- Database access is protected with Row Level Security

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
