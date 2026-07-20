# StudySprint 🚀 — AI-Powered Learning Marketplace

StudySprint is a premium, high-end, AI-powered learning marketplace designed for video courses, PDF study resources, tutoring slots, and workshops. It bridges the gap between expert creators and students by utilizing state-of-the-art Large Language Models (LLMs) to customize the education experience.

---

## 🌟 Key Features

### 🤖 1. AI Study Advisor Widget

- **Interactive Tutoring:** A client-side streaming chat drawer available on all dashboards and course detail pages.
- **Smart Study Schedules:** Can construct a tailored learning roadmap based on user-input target learning goals.
- **Persistent Sessions:** Chat sessions are saved in MongoDB and can be cleared or reloaded seamlessly.
- **Visual Alerts:** Features an active unread indicator badge that updates dynamically on incoming messages.

### 📝 2. Creator Description Copilot

- **High-Converting Syllabus Outlines:** AI assistant inside the "Add Course" listing editor that helps creators generate rich, SEO-friendly descriptions, tag suggestion arrays, and syllabus structures based on basic prompt guidelines.

### 🎯 3. Smart AI Recommendation Engine

- **Contextual Profiling:** Uses MongoDB pipelines to analyze user-enrolled course categories and learning goals.
- **Interaction Tracking:** Dismissing courses hides them for 30 days, while clicking on courses boosts those categories dynamically in future suggestions.

### 🔐 4. Unified Authentication Layer

- **Secure Cookies:** Powered by **Better Auth** using a dedicated MongoDB adapter.
- **Multi-Provider Support:** Supports standard Email/Password authentication as well as Google Social Sign-In integrations.

---

## 🛠️ Technology Stack

### Frontend Client

- **Core:** React 19, Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS v4, DaisyUI v5 (Plugins)
- **Animations:** Framer Motion (for smooth layouts, modals, and draw sliders)
- **State Management:** Zustand, TanStack React Query v5
- **Data Visualization:** Recharts (platform progress area charts)
- **Icons:** Lucide React

### Backend Server

- **Core:** Node.js, Express 5.x (TypeScript compiled via `tsc`)
- **Database:** MongoDB, Mongoose 9.x (Aggregations and schemas)
- **Security & Auth:** Better Auth Node SDK
- **AI Orchestration:** OpenAI Node SDK connected to OpenRouter models

---

## 📂 Project Directory Structure

```text
StudySprint/
├── client/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── about/          # Premium About Us page
│   │   │   ├── courses/        # Explore, Add, & Course detail layouts
│   │   │   ├── dashboard/      # Learner analytics & smart suggestions
│   │   │   ├── login/          # Custom login page with demo triggers
│   │   │   ├── profile/        # Manage learning goals & profile details
│   │   │   ├── globals.css     # Tailwind v4 import & DaisyUI configs
│   │   │   └── layout.tsx      # Query & session providers injection
│   │   ├── components/
│   │   │   ├── AIChatWidget.tsx# AI Study advisor sidebar component
│   │   │   └── Card.tsx        # High-end border & hover shadow container
│   │   ├── lib/
│   │   │   └── auth-client.ts  # Better Auth client hook setups
│   │   └── providers/
│   │       └── QueryProvider.tsx
│   └── package.json
│
└── server/                     # Node/Express Backend
    ├── src/
    │   ├── config/
    │   │   ├── db.ts           # Mongoose connect setup
    │   │   └── seed.ts         # High-quality DB seeds (users, courses, reviews)
    │   ├── lib/
    │   │   └── auth.ts         # Better Auth initialization
    │   ├── models/             # Mongoose schemas (Course, User, Review, logs)
    │   ├── routes/             # Core API endpoints (AI, profile, dashboards)
    │   ├── services/
    │   │   └── aiService.ts    # OpenRouter API communication helpers
    │   └── index.ts            # App entrypoint (loads dotenv first)
    └── package.json
```

---

## 🔑 Seeding & Demo Login Credentials

The database automatically seeds on server startup if the courses collection is empty. All seeded users have the password set to **`password123`**.

| User Name             | Role    | Email Address                      | Specialty / Target         |
| :-------------------- | :------ | :--------------------------------- | :------------------------- |
| **Emma Watson**       | Student | `emma@student.studysprint.com`     | React, CSS, JavaScript     |
| **John Doe**          | Student | `john.doe@student.studysprint.com` | Product Management, AI     |
| **Dr. Sarah Jenkins** | Creator | `sarah.jenkins@studysprint.edu`    | Computer Science Professor |
| **Alex Rivera**       | Creator | `alex.design@studysprint.io`       | UI/UX & Design Systems     |
| **Sophia Martinez**   | Creator | `sophia.lang@studysprint.org`      | Languages Polyglot Coach   |

---

## 🚀 Deployed Environment Configurations

### Server (Deploying on Render)

1. **Language:** `Node`
2. **Root Directory:** `server`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/index.js`
5. **Required Env Variables:**
   - `MONGO_URI`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_BASE_URL` (Set to your Render backend root domain)
   - `CLIENT_URL` (Set to your Vercel frontend domain)
   - `OPENROUTER_API_KEY`

### Client (Deploying on Vercel)

1. **Framework Preset:** `Next.js`
2. **Root Directory:** `client`
3. **Build and Output Settings:** Leave as Default (Switches toggled **OFF**)
4. **Required Env Variables:**
   - `NEXT_PUBLIC_API_URL` (Points to Render backend: `https://studysprint-aiagent-server.onrender/api`)
   - `NEXT_PUBLIC_BETTER_AUTH_URL` (Points to Vercel domain: `https://study-sprint-ai-agent-client.vercel.app`)
   - `BETTER_AUTH_URL` (Same as above)
   - `BETTER_AUTH_SECRET` (Must match server config)
