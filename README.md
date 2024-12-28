# Newsletter Generation Application

A Next.js application that generates customized newsletters using AI, with a focus on user experience and efficient content delivery.

## Features

- **Onboarding Form**
  - Company information collection
  - Target audience definition
  - Newsletter objectives setting
  - Contact email collection
  - Real-time validation
  - Success feedback with delivery information

- **Database Integration**
  - Secure data storage with Supabase
  - Separate tables for companies and newsletters
  - Efficient data organization
  - Real-time updates

- **User Interface**
  - Clean, modern design
  - Responsive layout
  - Intuitive form progression
  - Success modal with next steps
  - Error handling and feedback

## Tech Stack

- **Frontend**
  - Next.js 13+ (App Router)
  - React
  - TypeScript
  - Tailwind CSS

- **Backend**
  - Next.js API Routes
  - Supabase
  - OpenAI (coming soon)
  - Brevo Email Service (coming soon)

- **Database**
  - PostgreSQL (via Supabase)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_key_here
   SUPABASE_URL=your_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   SUPABASE_ANON_KEY=your_key_here
   BREVO_API_KEY=your_key_here
   BREVO_SENDER_EMAIL=your_email_here
   BREVO_SENDER_NAME=your_name_here
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
newsletter-3section-app/
├── app/
│   ├── api/
│   │   ├── onboarding/
│   │   │   └── route.ts
│   │   └── newsletter/
│   ├── page.tsx
│   └── layout.tsx
├── utils/
│   ├── supabase-admin.ts
│   ├── openai.ts
│   └── email.ts
└── types/
    └── index.ts
```

## Current Status

- Form creation and validation
- Supabase integration
- API routes for form submission
- Success modal with delivery information
- Newsletter generation (In Progress)
- Email integration (Pending)
- Review system (Pending)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
