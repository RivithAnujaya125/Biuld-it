# build.it 🛠️

An intelligent, AI-powered project scoper and progress verifier designed for Computer Science students and developers. **build.it** engineers tailored engineering project roadmaps based on skill level, tech stack, goals, and constraints—and continuously verifies actual progress against the roadmap by analyzing real GitHub repositories with Gemini code reasoning.

---

## 🚀 Features

- **Tailored Roadmap Generation**: Synthesizes realistic, structured, independently-demoable project roadmaps matching student profiles, career targets, and hard constraints (e.g. open source only, no generic CRUD apps).
- **Verify My Progress**: Cross-references a student's actual GitHub repository source code against their roadmap milestones using Gemini's deep code-reasoning capabilities.
- **Milestone Status Badges & Evidence**: Automatically flags milestones as `Complete` (green), `In Progress` (amber), or `Not Started` (gray), citing specific relevant files and actionable mentor evaluation notes.
- **Firebase Authentication & Persistence**: Optional GitHub OAuth sign-in via Firebase Auth; automatically saves generated roadmaps to Firestore under `/users/{userId}/roadmaps`.
- **Figma Scaffolding Dashboard**: Scaffolding view (`/ #dashboard`) enabling authenticated users to fetch and inspect their saved roadmaps.

---

## 🧠 Gemini Reasoning & Thinking Levels

| Flow | Model | Thinking Level | Rationale |
|---|---|---|---|
| **Roadmap Generation** | Gemini 2.5 / 3.8 Flash | `MEDIUM` | Fast, low-latency synthesis of project specifications, architectural stacks, and milestones. |
| **Repo Progress Verification** | Gemini 3.8 Flash | `HIGH` | Deep, multi-step code reasoning across entire file trees, AST syntax, and multi-file dependencies. Verification runs infrequently per project, justifying the deeper thinking budget. |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Gemini API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=biuld-it.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=biuld-it
VITE_FIREBASE_STORAGE_BUCKET=biuld-it.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1066217853664
VITE_FIREBASE_APP_ID=1:1066217853664:web:5626d48060184d572f3685

# Optional: GitHub Personal Access Token (raises rate limit from 60 req/hr to 5,000 req/hr)
# GITHUB_TOKEN=your_github_personal_access_token
```

---

## 📡 GitHub REST API Rate Limits & Verification Caveats

- **Unauthenticated Limit**: GitHub REST API allows **60 requests/hour** per IP address for public repository tree lookups.
- **Private Repositories**: Only public repositories can be verified without custom OAuth tokens. Attempting to verify private or missing repositories returns a clear notice: `Repo not found or private — make it public to verify`.
- **Context Window Budget**: File content fetching is capped at ~300K tokens (~1.2MB text) to leave ample headroom in Gemini Flash's 1M context window for the prompt, thinking trace, and structured response. Files in `node_modules`, `dist`, `.git`, build output, images, binaries, and lock files are skipped automatically.

---

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

Under MIT License. © 2026 build.it.
