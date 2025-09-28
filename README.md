# Career Reality Coach

A Hinge-style stepper wizard web app that uses an AI "Career Reality Coach" to grill users with brutally specific yes/no questions, then scores fit, highlights mismatches, and outputs next-step checklists and alternative careers.

## Features

- **Adaptive Question Generation**: AI-powered questions that adapt based on user responses
- **US-First Data**: State-specific career facts, licensing requirements, and salary data
- **Brutal Honesty**: Cuts through romanticized career fantasies to reveal daily realities
- **Comprehensive Scoring**: Multi-bucket scoring system (Personality, Daily Reality, Commitment, Lifestyle)
- **Actionable Results**: Next steps checklist and alternative career suggestions
- **Modern UI**: Clean, card-centric design with smooth animations
- **Admin Panel**: Manage career facts, question templates, and view analytics

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js with Google OAuth and Magic Link
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Template-based question generation (extensible for LLM integration)
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional)
- Email server configuration (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd career-reality-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/career_reality_coach"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email (optional)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The app uses a comprehensive Prisma schema with the following main models:

- **User**: User accounts and profiles
- **UserSession**: Career reality check sessions
- **GeneratedQuestion**: AI-generated questions for each session
- **Answer**: User responses to questions
- **Verdict**: Final scoring and analysis results
- **CareerFact**: State-specific career information
- **QuestionTemplate**: Reusable question patterns
- **Career**: Alternative career suggestions

## API Routes

### Core Application
- `POST /api/session/start` - Create new reality check session
- `POST /api/question/next` - Get next question for session
- `POST /api/answer` - Submit answer and get updated scoring
- `POST /api/verdict` - Generate final results and verdict

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Admin
- `GET/POST /api/admin/facts` - Manage career facts
- `GET/POST /api/admin/templates` - Manage question templates
- `GET /api/admin/sessions` - View user sessions

## Scoring System

The app uses a sophisticated scoring system with four main buckets:

1. **Personality Fit (35%)** - Mental/emotional demands
2. **Daily Reality (25%)** - Actual day-to-day work
3. **Commitment (20%)** - Training and investment required
4. **Lifestyle (20%)** - Work-life balance impact

### Adaptive Stopping
The system stops asking questions when:
- High confidence is reached (>90%)
- Hard fail: 3+ deal-breakers in any bucket
- Hard pass: All critical questions passed + minimum questions answered
- Maximum questions reached (20)

## Admin Panel

Access the admin panel at `/admin` (requires admin email: `admin@example.com`)

Features:
- Manage career facts by state and role
- Edit question templates and weights
- View user sessions and analytics
- Configure scoring parameters

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app is built with standard Next.js patterns and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Customization

### Adding New Question Types
1. Add new bucket to `BUCKET_WEIGHTS` in `src/lib/scoring.ts`
2. Create templates in the admin panel
3. Update the UI to handle new bucket types

### Integrating Real AI
Replace the template-based system in `src/lib/ai.ts` with actual LLM API calls:
- Together AI
- OpenRouter
- OpenAI
- Anthropic

### Adding New States/Careers
1. Add career facts via admin panel
2. Update `US_STATES` array in intake form
3. Add state-specific logic in scoring engine

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for helping people make informed career decisions.