# Newsletter Application

A Next.js-based newsletter management application with AI-powered content generation and email automation.

## Features

- 📝 Multi-step onboarding form
- 📊 CSV contact list processing
- 🤖 AI-powered content generation (OpenAI)
- 🎨 AI image generation (Replicate)
- 📧 Email automation (Brevo)
- 🗄️ Database integration (Supabase)
- ✨ Modern UI with error handling
- 🔒 Type-safe implementation

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Supabase account
- API keys for OpenAI, Replicate, and Brevo

## Quick Start

1. **Clone and Install**
   ```bash
   git clone [your-repo-url]
   cd newsletter-3section-app
   npm install --legacy-peer-deps
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the following environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `REPLICATE_API_KEY`
   - `BREVO_API_KEY`
   - `BASE_URL`
   - `NODE_ENV`

3. **Development**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
newsletter-3section-app/
├── components/          # React components
├── pages/              # Next.js pages and API routes
├── public/             # Static assets
├── styles/             # CSS styles
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── server.ts           # Custom server configuration
```

## API Routes

- `/api/onboarding`: Handles form submission and file uploads
- `/api/generate`: AI content generation
- `/api/preview`: Newsletter preview generation
- `/api/send`: Email sending endpoint

## Development Guidelines

1. **Code Style**
   - Use TypeScript for all new files
   - Follow ESLint configuration
   - Use proper error handling
   - Maintain type safety

2. **Git Workflow**
   - Create feature branches
   - Write descriptive commit messages
   - Keep PRs focused and small

3. **Testing**
   - Write unit tests for utilities
   - Add integration tests for API routes
   - Test error scenarios

## Error Handling

The application implements a comprehensive error handling system:
- Client-side form validation
- API error responses with proper status codes
- Error boundary for React components
- Proper error logging and monitoring

## Security

- Environment variables for sensitive data
- Input validation and sanitization
- File upload restrictions
- API rate limiting
- Proper CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or open an issue in the repository.
