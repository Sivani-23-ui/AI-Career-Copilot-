# AI Career Copilot

> AI-powered career guidance platform for college students — built for IBM Student AI Hackathon.

## What it does

AI Career Copilot helps students:
- **Analyze their resume** — extract skills, identify strengths, get suggestions
- **Explore career paths** — get AI-matched career recommendations
- **Understand skill gaps** — compare your skills vs. what a career requires
- **Follow a learning roadmap** — week-by-week personalized study plan
- **Find courses** — curated free and paid resources matched to skill gaps
- **Practice interviews** — AI mock interview with real-time answer feedback

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | OpenAI API (compatible with IBM watsonx proxy) |
| Auth | JWT + bcryptjs |

---

## Project Structure

```
ai-career-copilot/
├── client/                  # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── (auth)/          # Login & Signup
│   │   └── (dashboard)/     # All dashboard pages
│   ├── components/ui/       # Reusable UI components
│   ├── lib/                 # API client, auth helpers
│   └── types/               # TypeScript interfaces
│
├── server/                  # Express backend
│   ├── controllers/         # Business logic
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # JWT auth middleware
│   ├── services/            # AI service layer
│   ├── config/              # Database config
│   └── server.js            # Entry point
│
├── .env.example             # Environment variable template
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

**Server:**
```bash
cd server
cp ../.env.example .env
# Edit .env with your values
```

Required values in `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-career-copilot
JWT_SECRET=your_very_long_random_secret_here
DEMO_MODE=true         # Set to false when you have an AI API key
OPENAI_API_KEY=        # Add your OpenAI key here (optional)
CLIENT_URL=http://localhost:3000
```

**Client:**
```bash
cd client
# .env.local is already created with default values
# Edit if your server runs on a different port
```

### 3. Start MongoDB

```bash
# If running locally:
mongod

# Or use MongoDB Atlas and set MONGODB_URI in .env
```

### 4. Run the Application

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## AI Configuration

### Option 1: Demo Mode (no API key needed)

Set `DEMO_MODE=true` in `server/.env`. The application will use realistic sample data for all AI features. Perfect for demos and presentations.

### Option 2: OpenAI API

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Set in `server/.env`:
   ```
   DEMO_MODE=false
   OPENAI_API_KEY=sk-...
   ```

### Option 3: IBM watsonx.ai

IBM watsonx.ai provides an OpenAI-compatible chat completions endpoint. To use it:
1. Get your IBM watsonx API key from [cloud.ibm.com](https://cloud.ibm.com)
2. Set up the watsonx proxy or use the OpenAI-compatible endpoint
3. Update `aiService.js` to point to the watsonx base URL:
   ```js
   openai = new OpenAI({
     apiKey: process.env.IBM_WATSONX_API_KEY,
     baseURL: 'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat', // watsonx endpoint
   });
   ```

---

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |

### AI Features
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/resume/analyze` | Analyze resume text |
| GET | `/api/resume/latest` | Get latest resume |
| POST | `/api/career/recommend` | Get career recommendations |
| POST | `/api/career/select` | Select a career goal |
| GET | `/api/career/profile` | Get career profile |
| POST | `/api/skills/analyze` | Skill gap analysis |
| POST | `/api/roadmap/generate` | Generate learning roadmap |
| GET | `/api/roadmap` | Get current roadmap |
| PUT | `/api/roadmap/task/:id/complete` | Toggle task completion |
| GET | `/api/courses/recommend` | Get course recommendations |
| POST | `/api/interview/start` | Start mock interview |
| POST | `/api/interview/answer` | Submit answer + get feedback |
| GET | `/api/interview/history` | Interview history |

---

## Testing the Features

1. **Create an account** at `/signup`
2. **Analyze your resume** — paste any resume text in Resume Analyzer
3. **Explore careers** — select skills, get recommendations, set a goal
4. **Check skill gap** — select a career, see what you're missing
5. **Generate roadmap** — get a weekly study plan
6. **Browse courses** — filter by skill or difficulty
7. **Practice interview** — select a role and answer 5 questions

---

## Deployment

### Frontend (Vercel)
```bash
cd client
# Push to GitHub, then connect repo to Vercel
# Set NEXT_PUBLIC_API_URL=https://your-backend.com
```

### Backend (Render / Railway)
```bash
cd server
# Push to GitHub, connect to Render/Railway
# Set all environment variables in the dashboard
# Use MongoDB Atlas for the database
```

---

## Important Notes

- Career readiness scores and recommendations are **AI estimates** — not real employer evaluations
- Mock interview feedback is for **practice only** — not a real interview
- Course links lead to real external platforms but content availability may change
- Demo mode uses pre-written sample data — it does not consume AI API credits

---

## License

MIT — Free to use, modify, and distribute for educational purposes.
