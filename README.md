# Newsletter Generator App

A modern web application that automates the creation and delivery of personalized newsletters using AI. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 1. Smart Onboarding
- Multi-step form for company information
- CSV contact list upload
- Real-time form validation
- Interactive loading states with engaging messages
- Success animations with confetti

### 2. AI-Powered Newsletter Generation
- Industry-specific insights using OpenAI
- Three-section newsletter format
- Personalized content based on company profile
- Automated HTML email template generation

### 3. Email Integration
- Direct newsletter delivery via Brevo API
- Professional email templates
- Delivery status tracking
- HTML email support

### 4. Modern UI/UX
- Responsive design
- Loading animations
- Progress indicators
- Success/error feedback
- Engaging user interactions

## Recent Updates
- **Build Process Improvements**
  - Added cross-platform prebuild script
  - Enhanced Vercel deployment compatibility
  - Improved build directory management
  - Resolved deployment script issues

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, React
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **AI**: OpenAI GPT-4
- **Email**: Brevo (formerly Sendinblue)
- **Animations**: React Confetti, React Spinners

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd newsletter-3section-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   OPENAI_API_KEY=your_openai_key
   BREVO_API_KEY=your_brevo_key
   BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Last Updated
- Date: 2024-12-26
- Time: 09:39:00 PDT
- Status: Project is actively being developed. Build process optimized for deployment.

## Deployment Notes
- Uses `rimraf` for cross-platform build directory cleaning
- Verified local and Vercel build compatibility
- Recommended deployment platform: Vercel

## Database Schema

### Tables
1. **companies**
   - Company information
   - Contact details
   - Industry data

2. **contacts**
   - Contact list from CSV
   - Relationship to company

3. **newsletters**
   - Newsletter metadata
   - Generation status
   - Company relationship

4. **newsletter_sections**
   - Section content
   - HTML storage
   - Section ordering

## API Routes

- **/api/onboarding**: Handle company registration and CSV upload
- **/api/generate-newsletter**: Generate and send newsletters
- **/api/latest-newsletter**: Retrieve most recent newsletter

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
