# AI-Powered Newsletter Generator

## Overview
A powerful newsletter generation application built with Next.js, OpenAI, and Supabase. This application allows businesses to create professional, AI-generated newsletters with customized content and automated email delivery.

## Features
- 🤖 AI-powered content generation using OpenAI GPT-4
- 🎨 Three-section newsletter format:
  - Pain Point Analysis
  - Common Mistakes
  - Company Solutions
- 🖼️ Ultra-realistic DALL-E 3 generated images
  - Professional photography aesthetics
  - No text or people in images
  - Focus on objects and environments
- 📊 Contact management with CSV import
- 📧 Automated email delivery via Brevo
- 🔐 Secure authentication and data storage with Supabase
- 📱 Responsive design for all devices

## Tech Stack
- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI GPT-4, Replicate
- **Email Service**: Brevo
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Supabase account
- OpenAI API key
- Brevo API key
- Replicate API key

## Environment Variables
Create a `.env.local` file with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
REPLICATE_API_KEY=your_replicate_api_key
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=your_sender_name
BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/newsletter-generator.git
cd newsletter-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env.local`
- Fill in your API keys and configuration

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Features

### 1. Newsletter Generation
- AI-powered content generation
- Industry-specific customization
- Three-section format
- Professional templates

### 2. Contact Management
- CSV contact import
- Contact status tracking
- Automatic list management
- Unsubscribe handling

### 3. Email Delivery
- Automated sending
- Delivery tracking
- Error handling
- Status monitoring

### 4. User Interface
- Intuitive dashboard
- Real-time preview
- Mobile responsive
- Modern design

## Production Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy!

## Database Schema

The application uses Supabase with the following main tables:
- `companies`: Company information
- `contacts`: Contact list management
- `newsletters`: Newsletter content and metadata
- `newsletter_contacts`: Junction table for newsletter-contact relationships

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details

## Support
For support, email support@example.com or open an issue in the repository.

## Acknowledgments
- OpenAI for GPT API
- Supabase team for the amazing database service
- Brevo for email delivery
- Vercel for hosting

## Status
✅ Production Ready - Version 1.0.0
