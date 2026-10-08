# AI Why Am I Stuck Assistant

> **Production-Quality Final-Year Project: Cognitive Debugger & Engineering Meta-Learning Assistant**

An intelligent assistant designed to identify **why** a developer or student is stuck while learning, coding, debugging, planning, or architecting a technical system.

Unlike generic conversational chatbots (e.g. ChatGPT, Claude) that merely provide direct code snippets or verbose explanations, this system acts as a **structured cognitive debugger**. It diagnoses the fundamental failure mode (conceptual gap, debugging blindspot, scope ambiguity, architectural deadlock, or cognitive overload), drives Socratic targeted clarification questions, builds an actionable step-by-step resolution plan, tracks progress to resolution, and extracts long-term behavioral patterns to prevent recurring blockers.

---

## 🌟 The Core Cognitive Workflow

```
[User Problem Statement]
         │
         ▼
[1. Problem Analysis & Normalization]
         │
         ▼
[2. Stuck Type Classification (7-Category Taxonomy)]
         │
         ▼
[3. Root Cause & Misconception Isolation]
         │
         ▼
[4. Targeted Socratic Clarification (1-3 Questions)]
         │
         ▼
[5. Personalized Solution & Action Checklist]
         │
         ▼
[6. Verification Test & Resolution Post-Mortem]
         │
         ▼
[7. Long-Term Learning Pattern Aggregation]
```

---

## 🔬 The 7 Cognitive Stuck Types

| Stuck Type | Nature of Obstacle | Core Indicator |
| :--- | :--- | :--- |
| **`SYNTAX_OR_RUNTIME_DEFECT`** | Mechanical defect | TypeError, null dereference, unhandled exception. |
| **`CONCEPTUAL_GAP`** | Missing knowledge | Unfamiliar with underlying library, protocol, or lifecycle. |
| **`MENTAL_MODEL_DISTORTION`** | Flawed mental model | Assuming async code executes synchronously, mutating state directly. |
| **`ENVIRONMENT_OR_CONFIG_DRIFT`** | Tooling / Network drift | CORS, port collisions, missing environment variables. |
| **`ARCHITECTURAL_DEADLOCK`** | System design deadlock | Circular dependencies, tight coupling, impossible component tree. |
| **`SCOPE_PARALYSIS`** | Cognitive overload | Trying to solve too many things at once without atomic decomposition. |
| **`EDGE_CASE_BLINDSPOT`** | Boundary / Timing anomaly | Race condition, boundary condition, or unhandled data edge case. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v7, Axios.
- **Backend**: Node.js, Express.js, Helmet, Express Rate Limit, Cookie Parser, Zod validation.
- **Database**: MongoDB with Mongoose ODM (Users, StuckSessions, UserPatterns).
- **AI Intelligence**: Google Gemini API (`@google/generative-ai`) with structured JSON schema responses + built-in Cognitive Heuristic Engine for 100% reliable offline/demo operation.
- **Authentication**: JWT stored in secure `httpOnly`, `sameSite: 'lax'` cookies with bcrypt password hashing.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a MongoDB Atlas URI)

### 1. Start the Backend Server
```bash
cd backend
npm install
node seed.js    # Seeds demo data and demo account
npm run dev     # Starts Express server on http://localhost:5000
```

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

### 3. Open in Browser
Navigate to: **[http://localhost:5173](http://localhost:5173)**

#### Pre-Configured Demo Account:
- **Email**: `developer@antigravity.ai`
- **Password**: `cognitive1234`
*(Or click the "Fill Demo Credentials" button on the Sign-In page)*

---

## 📁 Project Architecture

```
AI Why Am I Stuck Assistant/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, environment loader
│   │   ├── controllers/        # Auth, Session, Analytics controllers
│   │   ├── middleware/         # JWT Auth, Zod validation, Rate limiter, Error handler
│   │   ├── models/             # User, StuckSession, UserPattern Mongoose schemas
│   │   ├── routes/             # Express route definitions (/api/auth, /api/sessions, /api/analytics)
│   │   ├── services/           # Gemini AI service, Analytics aggregation engine
│   │   └── server.js           # Express app initialization
│   ├── test-e2e.js             # Automated end-to-end integration test
│   ├── seed.js                 # Database seeder with realistic test cases
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client with credentials
│   │   ├── components/         # Badges, CodeBlock, Navbar, PostMortemModal, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── pages/              # Landing, Login, Register, Dashboard, StuckWizard,
│   │   │                       # StuckWorkspace, Analytics, History
│   │   ├── App.jsx             # React Router structure
│   │   ├── index.css           # Tailwind styles and glassmorphic UI
│   │   └── main.jsx            # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🔑 Key Features & Highlights

1. **Anti-Chatbot Cognitive Debugger**: Enforces structured problem decomposition; refuses to dump random code fixes before classifying the root cause.
2. **Socratic Clarification Gate**: Poses 1 to 3 targeted questions with suggested answers to isolate the broken invariant before generating the action plan.
3. **Actionable Checklist**: Step-by-step tasks with checkboxes, code snippets with copy button, and a concrete verification test.
4. **Post-Mortem Reflection**: Prompts the developer to record *"what actually fixed it"* and their key takeaways, reinforcing metacognition.
5. **Long-Term Pattern Analytics**: Aggregates recurring stuck types and identifies persistent blindspots with AI-driven recommendations.
6. **Production Security**: HTTP-only JWT cookies, rate limiting on AI inference, input validation with Zod schemas, structured Pino logging, and CORS credential protection.

---

## ☁️ Production Environment & MongoDB Atlas Preparation

Follow these steps to prepare your hosting environment (e.g. Render, Railway, AWS) for production deployment:

### 1. MongoDB Atlas Cluster Setup
1. **Create an Atlas Account**: Navigate to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. **Create a Database Cluster**: Select a free-tier M0 or production cluster in your preferred geographic region.
3. **Create Database User Credentials**:
   - Go to **Security > Database Access > Add New Database User**.
   - Select **Password** authentication and provide a secure username and password.
   - Assign the **Read and write to any database** built-in role.
4. **Configure Network Access Whitelist**:
   - Go to **Security > Network Access > Add IP Address**.
   - For serverless or dynamic cloud hosts (such as Render), allow access from anywhere: `0.0.0.0/0` (with description "Cloud Hosting Platform").
5. **Obtain Connection String**:
   - Go to **Database > Clusters > Connect > Drivers > Node.js**.
   - Copy the SRV connection URI:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/why_am_i_stuck_db?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your Atlas database user credentials.
   - Specify `/why_am_i_stuck_db` as the target database name.

### 2. Production Environment Variables Reference

Configure these environment variables in your deployment dashboard:

| Variable | Required in Prod? | Description & Recommended Setting |
| :--- | :---: | :--- |
| `NODE_ENV` | **Yes** | Set to `production`. Enables strict security checks, masks internal stack traces, and enforces secure cookies. |
| `PORT` | **Yes** | Port assigned by hosting platform (default: `5000` or provided by `$PORT`). |
| `MONGO_URI` | **Yes** | Your MongoDB Atlas connection string (`mongodb+srv://...`). |
| `JWT_SECRET` | **Yes** | Cryptographically strong secret (minimum 16 chars). Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `JWT_EXPIRES_IN` | Optional | Token lifetime (default: `7d`). |
| `COOKIE_SAME_SITE` | **Yes** (if cross-domain) | Set to `none` if frontend and backend are hosted on separate domains/origins with HTTPS, or `lax` if served under the same origin. |
| `CLIENT_URL` | **Yes** | Complete HTTPS URL of the deployed frontend (e.g. `https://my-app.vercel.app` or `https://my-app.onrender.com`). |
| `ALLOWED_ORIGINS` | Optional | Comma-separated list of additional permitted origins. |
| `LOG_LEVEL` | Optional | Minimum logging level (`info`, `warn`, `error`, `debug`). Defaults to `info`. |
| `GEMINI_API_KEY` | Optional | Google Gemini API key. If omitted, the assistant seamlessly runs on the built-in Cognitive Heuristic Engine with zero interruption. |

> [!WARNING]
> **Secret Hygiene Rules**:
> - Never commit `.env` files into Git.
> - Never expose `JWT_SECRET`, `MONGO_URI`, or `GEMINI_API_KEY` to frontend code or client bundles.
> - `seed.js` includes a production guard (`ALLOW_PRODUCTION_SEED=true`) preventing accidental clearing or overwriting of production collections.

---

## 🚢 Deployment Architecture & Render Configuration

The project is pre-configured with a Render Blueprint specification ([`render.yaml`](./render.yaml)) supporting decoupled, multi-service deployment:

### Architecture Overview

```
                                      ┌────────────────────────────────┐
                                      │       Client Browser           │
                                      └───────┬────────────────┬───────┘
                                              │                │
                             Static Assets    │                │  API Requests (/api)
                             & SPA Routes     │                │  (with Credentials)
                                              ▼                ▼
                          ┌───────────────────────┐    ┌───────────────────────────┐
                          │    Frontend Site      │    │    Backend Web Service    │
                          │ (Render Static Site)  │    │     (Render Web Service)  │
                          │   Publish: ./dist     │    │   Start: node src/server  │
                          │   SPA: /index.html    │    │ Health: /api/health       │
                          └───────────────────────┘    └─────────────┬─────────────┘
                                                                     │
                                                                     ▼
                                                       ┌───────────────────────────┐
                                                       │   MongoDB Atlas Cluster   │
                                                       │ (mongodb+srv://...)       │
                                                       └───────────────────────────┘
```

### 1. Backend Web Service (`ai-why-am-i-stuck-backend`)
- **Runtime**: Node.js (Express.js)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Production Start Command**: `npm start` (executes `node src/server.js`)
- **Health Check Path**: `/api/health` (HTTP 200/503 health probe)
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000` (or host-provided dynamic `$PORT`)
  - `MONGO_URI`: Atlas SRV connection string
  - `JWT_SECRET`: Minimum 16-character cryptographic secret
  - `CLIENT_URL`: Deployed frontend HTTPS origin
  - `ALLOWED_ORIGINS`: Permitted CORS origins
  - `COOKIE_SAME_SITE`: `none` (cross-domain HTTPS) or `lax`
  - `GEMINI_API_KEY`: Optional; defaults to Cognitive Heuristic Engine if omitted

### 2. Frontend Static Site (`ai-why-am-i-stuck-frontend`)
- **Runtime**: Static Site (Vite + React)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **SPA Fallback Routing**: Handled via `routes` rewrite in `render.yaml` and `frontend/public/_redirects` (`/* /index.html 200`), ensuring direct hits on `/dashboard`, `/profile`, `/settings`, etc., do not trigger 404s.
- **API Communication**: Configured via `VITE_API_URL` environment variable in [`frontend/src/api/client.js`](./frontend/src/api/client.js). If unset, defaults to relative `/api` for local development.

*(Note: Live deployment instantiation and service provisioning are performed in Step 7).*

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive 70-test automated test suite across unit, component, API integration, and E2E layers:

```bash
# Run backend unit and API integration tests (42 tests)
cd backend && npm test

# Run frontend React component tests (28 tests)
cd frontend && npm test

# Verify production frontend build
cd frontend && npm run build

# Run end-to-end integration flow against running API
node backend/test-e2e.js
```

