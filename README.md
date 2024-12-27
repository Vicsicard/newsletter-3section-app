# AI-Powered Newsletter Generator

A Next.js application that automatically generates professional newsletters with AI-generated content and images.

## Features

- 🤖 AI-powered content generation using GPT-4
- 🎨 Automatic image generation with DALL-E
- 📝 Multi-step form for company information
- 📊 Industry-specific content generation
- 📧 Contact list management
- 🎯 Customized newsletter sections
- ⚡ Real-time preview
- 🔄 Async content generation
- 🎨 Responsive design

## Tech Stack

- **Framework**: Next.js 14
- **UI**: Tailwind CSS, HeadlessUI
- **Database**: Supabase
- **AI**: OpenAI (GPT-4, DALL-E)
- **Email**: Brevo
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Loading States**: react-spinners
- **Success Animation**: react-confetti

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=your_key
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   SUPABASE_ANON_KEY=your_key
   BREVO_API_KEY=your_key
   BREVO_SENDER_EMAIL=your_email
   BREVO_SENDER_NAME=your_name
   BASE_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Fill out the company information form
2. Upload or enter contact list
3. Click "Generate Content" to create newsletter
4. Preview the generated newsletter with AI content and images
5. Send the newsletter to your contact list

## Current Status

- ✅ Form submission
- ✅ Newsletter content generation
- ✅ Image generation with DALL-E
- ✅ Newsletter preview with images
- ✅ Error handling
- ✅ Loading states
- ✅ Success notifications

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
