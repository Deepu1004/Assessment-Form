# Single-Score Cumulative Assessment Application (Model A)

A production-quality, full-stack assessment web application and Admin Assessment Studio built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB**, **Prisma ORM**, and **Zod**.

---

## 🌟 1. Application Overview

This application presents users with a 5-question multiple-choice assessment powered by a **Single-Score Cumulative Engine (Model A)**. 

Each answer option carries a single integer score (e.g., Option A = 1, Option B = 2, Option C = 3, Option D = 4, Option E = 5). Upon completion, the backend computes the user's **cumulative score total** and matches it against administrator-configured score ranges to determine their personality archetype:

- 🧭 **Explorer** (Score Range: 5 – 9 pts): Curious, adaptable, and energized by discovering new possibilities.
- 🛠️ **Builder** (Score Range: 10 – 13 pts): Practical, creative, and focused on turning ideas into reality.
- 🔬 **Analyst** (Score Range: 14 – 17 pts): Logical, methodical, and driven by understanding evidence and systems.
- 🤝 **Connector** (Score Range: 18 – 21 pts): Collaborative, empathetic, and focused on people and shared outcomes.
- 👑 **Leader** (Score Range: 22 – 25 pts): Decisive, goal-oriented, and comfortable taking ownership.

### Key Architectural Highlights:
- **Model A Single-Score Engine**: Computes total cumulative scores (`sum(option.score)`) and maps them to continuous, non-overlapping `ResultType` score boundaries (`minimumScore <= finalScore <= maximumScore`).
- **Historical Audit Immutability**: Every submitted answer persists `scoreAtSubmission` directly in the database. If an administrator later changes an option's score, past submission records remain historically accurate and immutable.
- **Authenticated Admin Assessment Studio**: Protected by HTTP-only cookie authentication (`/admin/login`). Features 5 dedicated studio tabs for full control over questions, options, matrix scores, result ranges, and live analytics.
- **Single-Click Batch Matrix Saving**: The Scoring Matrix tab (`/admin/scoring`) allows administrators to edit all option scores in a grid layout and persist all changes at once with a single **"Save All Matrix Scores"** operation.
- **Server-Side Scoring**: Results cannot be tampered with from the client. The browser submits only question/option selections.

---

## 🏗️ 2. Architecture & Application Flow

```text
Public Assessment (/) ──► Start Assessment (/assessment)
                             │
                             ▼
              Question 1 → Q2 → Q3 → Q4 → Q5
                             │
                             ▼
                    Review Answers Step
                             │
                             ▼
              Submit Payload → POST /api/assessment/submit
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend Server Logic:                                       │
│ 1. Validate payload via Zod                                 │
│ 2. Fetch authoritative AnswerOption scores from MongoDB      │
│ 3. Sum total cumulative score (e.g., 3 + 5 + 2 + 4 + 3 = 17) │
│ 4. Match score against ResultType boundaries (17 -> Analyst) │
│ 5. Perform DB transaction (Session, Answers, Result)        │
│ 6. Persist scoreAtSubmission for historical audit trail     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
          Redirect to Result Page (/result/[sessionId])
                             │
                             ▼
         Admin Assessment Studio (/admin) [Authenticated]
         ├── 📊 Analytics Dashboard Overview
         ├── ❓ Questions & Options Manager
         ├── 🔢 Scoring Matrix (Single-Click Batch Save)
         ├── 🎚️ Result Type Score Ranges (Overlap Validation)
         └── 🛠️ Interactive Assessment Builder (+ Preview Button)
```

---

## 🛠️ 3. Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / Custom Tailwind CSS styling (Glassmorphism dark aesthetics & dynamic micro-animations)
- **Database**: MongoDB 7.0 (Replica Set enabled via Docker Compose for transactions)
- **ORM**: Prisma ORM v6
- **Validation**: Zod (Payload validation & score range overlap verification)
- **Authentication**: Username/password admin accounts (`lib/auth.ts`) + HTTP-Only Cookie Session Management (`ADMIN_SECRET`)
- **Testing**: Vitest (Unit & Integration tests)

---

## 📋 4. Prerequisites

- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Docker & Docker Compose**: Installed and running

---

## 🔑 5. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb://localhost:27017/personality_db?replicaSet=rs0&directConnection=true"
ADMIN_SECRET="super-secret-admin-key-change-this-in-prod"
```

Admin usernames/passwords are managed in `lib/auth.ts` (`ADMIN_ACCOUNTS`) rather than environment variables.

---

## 🚀 6. Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB container with replica set support
docker-compose up -d

# 3. Synchronize MongoDB schema with Prisma
npx prisma db push

# 4. Seed database with Model A questions, single integer scores, and score ranges
npx prisma db seed

# 5. Run test suite
npm test

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public assessment or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Studio (Password: `admin123`).

---

## 📊 7. Database Schema (Prisma)

The Model A schema in `prisma/schema.prisma` includes:

1. **`ResultType`**: Defines score range outcomes (`name`, `slug`, `description`, `minimumScore`, `maximumScore`, `displayOrder`, `active`).
2. **`Question`**: Stores assessment questions (`questionText`, `displayOrder`, `active`).
3. **`AnswerOption`**: Answer options belonging to a question with a single `score` (Int) integer (`optionText`, `optionKey`, `score`, `displayOrder`).
4. **`AssessmentSession`**: Tracks session status and final cumulative score (`sessionToken`, `startedAt`, `completedAt`, `status`, `finalScore`).
5. **`AssessmentAnswer`**: Persists user answer choice and **`scoreAtSubmission`** for historical audit immutability.
6. **`AssessmentResult`**: Persists winning `ResultType` and calculated `finalScore`.

---

## 🧮 8. Scoring Engine & Range Matching Logic

The scoring engine (`lib/scoring.ts`) computes scores server-side:

```typescript
// 1. Calculate cumulative sum
const finalScore = selectedOptions.reduce((sum, opt) => sum + opt.score, 0);

// 2. Match against configured ResultType range
const matchedType = resultTypes.find(
  (rt) => finalScore >= rt.minimumScore && finalScore <= rt.maximumScore
);
```

### Boundary & Overlap Rules:
- Scores are matched inclusively against `minimumScore` and `maximumScore`.
- Result type range creation/updates in the Admin Studio automatically validate that no score ranges overlap (e.g. 5–9 and 10–13 is valid; 5–12 and 10–15 is rejected).

---

## 🌐 9. API Endpoints

### Public Assessment Endpoints
- `GET /api/assessment`: Fetches active questions and option keys/texts (excludes scores).
- `POST /api/assessment/submit`: Submits answer selections, calculates total cumulative score, persists transaction with `scoreAtSubmission`, and returns result.
- `GET /api/assessment/result/[sessionId]`: Retrieves user result outcome and final score.

### Admin Authentication Endpoints
- `POST /api/admin/login`: Authenticates admin password and sets HTTP-only session cookie.
- `POST /api/admin/logout`: Clears admin authentication cookie.
- `GET /api/admin/me`: Verifies current admin session.

### Admin Management Endpoints
- `GET /api/admin/overview`: Returns submission totals, score analytics (average, min, max score), archetype distribution, and recent submissions.
- `GET /api/admin/submission/[sessionId]`: Returns detailed historical inspection log with per-question `scoreAtSubmission`.
- `GET/POST /api/admin/questions`: Questions list & creation.
- `PUT/DELETE /api/admin/questions/[id]`: Question edit & deletion.
- `POST /api/admin/questions/[id]/options`: Add answer option to question.
- `PUT/DELETE /api/admin/options/[id]`: Edit/delete answer option.
- `GET /api/admin/scoring`: Retrieves scoring matrix grid data.
- `PUT /api/admin/scoring`: **Bulk updates all matrix option scores in one operation**.
- `GET/POST /api/admin/results`: Retrieves and creates result type score ranges with overlap validation.
- `PUT/DELETE /api/admin/results/[id]`: Updates/deletes result type score ranges.

---

## 🧪 10. Test Suite

Run the Vitest test suite with:

```bash
npm test
```

### Included Tests:
- **Scoring Engine (`__tests__/scoring.test.ts`)**:
  - Cumulative score calculation (`1 + 2 + 3 + 4 + 5 = 15`).
  - Score range outcome matching (Score 9 -> Explorer, 10 -> Builder, 14 -> Analyst).
  - Score boundary conditions (minimum, maximum, min-1, max+1).
  - Score range overlap validation (rejection of overlapping ranges).
- **API & Audit Persistence (`__tests__/api.test.ts`)**:
  - Zod payload validation.
  - Historical score immutability (`scoreAtSubmission` retention across option score updates).
