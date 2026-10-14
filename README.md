# Sentix — Minimalist Tweet Sentiment Analysis Engine

Sentix is a high-performance, minimalist Twitter sentiment analysis web application engineered with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**. 

It features real-time natural language processing, stateless **JWT authentication**, an **in-memory JSON database** with automatic disk/serverless snapshotting, and an ultra-clean user interface strictly conforming to a **zero purple/blue** color palette.

---

## Table of Contents

1. [Features](#features)
2. [Design Philosophy & Aesthetic Constraints](#design-philosophy--aesthetic-constraints)
3. [Technology Stack & Architecture](#technology-stack--architecture)
4. [File Structure](#file-structure)
5. [In-Depth Implementation Details](#in-depth-implementation-details)
   - [1. Sentiment Analysis Engine](#1-sentiment-analysis-engine)
   - [2. In-Memory JSON Database](#2-in-memory-json-database)
   - [3. Authentication & Security (JWT)](#3-authentication--security-jwt)
   - [4. History Persistence Rules](#4-history-persistence-rules)
6. [API Reference](#api-reference)
7. [Vercel Deployment Guide](#vercel-deployment-guide)
8. [Local Development & Setup](#local-development--setup)
9. [Pre-Seeded Demo Credentials](#pre-seeded-demo-credentials)
10. [License](#license)

---

## Features

### 1. Minimal Tweet Composer
- **Centered Single-Column Layout**: Focused writing surface optimized for high-speed input.
- **280-Character Counter**: Live character tracking with dynamic warning indicators when approaching or exceeding standard tweet limits.
- **Keyboard & Action Controls**: One-click analysis submission, instant clearing, and loading state animations.

### 2. Dual Sentiment Engines
- **Native Twitter NLP Engine (`lib/sentiment-engine.ts`)**:
  - High-precision local analyzer requiring **zero external API keys or network latency**.
  - **Emoji Valence Mining**: Evaluates emotional polarity of emojis (e.g., 🔥, 🚀, ❤️, 🥳, 💀, 😡, 🤮, 💩, 🤡).
  - **Twitter Slang & Jargon Dictionary**: Tailored weights for modern social lexicon (*fire, goat, banger, based, w, mid, trash, flop, cringe, l*).
  - **Negation & Inversion Heuristics**: Detects negative phrases and nuances (*"not bad"* is classified positively; *"never disappointed"* inverses negative terms).
  - **Capitalization & Punctuation Boosters**: Accounts for emphasis such as `"AMAZING"` or multiple exclamation marks (`"!!!"`).
  - **Emotion Extraction**: Categorizes sentiments into core emotions (*Joy / Excitement, Frustration / Anger, Optimism / Hope, Satisfaction, Disappointment, Curiosity*).
  - **Aspect-Based Categorization**: Detects targets such as *Performance & Speed, Customer Support, UI & UX Design, Reliability & Stability, Features & Updates, Pricing & Value*.
- **Hugging Face Inference API (`lib/hf-analyzer.ts`)**:
  - Ready-to-use client for `cardiffnlp/twitter-roberta-base-sentiment-latest` via Hugging Face Serverless Router.
  - Configurable via user settings or environment variables (`HUGGINGFACE_API_KEY`).

### 3. Sentiment Output Card
- **Primary Sentiment Badge**: Bold classification (`POSITIVE`, `NEUTRAL`, `NEGATIVE`) with calculated confidence percentage.
- **Score Distribution Bars**: Visual breakdown of Positive %, Neutral %, and Negative % with smooth CSS transitions.
- **Polarity Metric**: Continuous range from `-1.00` (strongly critical) to `+1.00` (strongly optimistic).
- **Subjectivity Index**: Quantifies whether text is an objective statement or personal opinion.
- **1-Click Copy**: Copies full markdown/plain-text summary directly to the clipboard with animated confirmation.

### 4. Analysis History System
- **Conditional Persistence**:
  - **Signed-in Users**: Analyses are tied to `userId` and saved to the in-memory JSON database. History **persists across page reloads and device sessions**.
  - **Guests / Unauthenticated**: Analyses are kept strictly in ephemeral client state for the current session and **automatically reset on page reload**.
- **Search & Filters**: Real-time client-side search by tweet content or handle, with filter pills for `All`, `Positive`, `Neutral`, and `Negative`.
- **Item Replay**: Clicking any historical card re-renders its detailed breakdown in the primary sentiment output card.
- **Granular Management**: Delete individual entries or purge entire user history in one click.

### 5. Stateless JWT Authentication
- **RFC 7519 Compliant**: Generated using `jose` (`HS256` signed tokens).
- **Password Hashing**: Salts and hashes credentials using `bcryptjs` with 10 salt rounds.
- **Dual Verification**: Accepts tokens via `HttpOnly` cookies (`token`) or HTTP `Authorization: Bearer <token>` headers.
- **Instant Demo Login**: Includes a one-click button to authenticate as `demo_trader` without typing.

---

## Design Philosophy & Aesthetic Constraints

- **Strict Zero Purple / Blue Rule**: In strict compliance with design constraints, all shades of blue (`#0000ff`, `sky`, `cyan`), purple (`indigo`, `violet`, `fuchsia`, `purple`) are entirely eliminated from the application.
- **Monochrome & Semantic Accents**:
  - **Base Canvas**: Deep zinc/carbon blacks (`#09090b`, `#121215`, `#18181b`) and crisp whites (`#ffffff`, `#fafafa`, `#f4f4f5`).
  - **Positive Accent**: Forest / Emerald Green (`#10b981`, `#059669`).
  - **Negative Accent**: Crimson / Rose Red (`#f43f5e`, `#e11d48`).
  - **Neutral Accent**: Warm Amber / Yellow (`#f59e0b`, `#d97706`).
- **Dark & Light Mode**: Seamless client-side theme toggling with cohesive contrast tokens and zero style mismatch.

---

## Technology Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4 (App Router) | Server Route Handlers, Turbopack, React Server Components |
| **UI Library** | React 19.3 | Client hooks (`useState`, `useEffect`, `useCallback`) |
| **Styling** | Tailwind CSS v4 | Class-based dark variants (`@custom-variant dark`), inline theme tokens |
| **Language** | TypeScript 5 | Strict static typing and interface schemas |
| **Authentication** | `jose` | Cryptographic JWT signing and verification |
| **Security** | `bcryptjs` | PBKDF2 / Blowfish password salting and hashing |
| **Icons** | `lucide-react` | Clean, minimalist SVG iconography |
| **Database** | In-Memory Singleton (`globalThis`) | Fast JSON-based state store with dual disk/`/tmp` fallback |
| **Deployment Target** | Vercel Serverless | Optimized for edge and serverless lambda runtimes |

---

## File Structure

```
fst-mini-project/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts          # POST: Runs sentiment analysis & conditionally persists
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts      # POST: Authenticates credentials & sets JWT cookie
│   │   │   ├── logout/
│   │   │   │   └── route.ts      # POST: Clears auth session cookie
│   │   │   ├── me/
│   │   │   │   └── route.ts      # GET: Returns authenticated user profile
│   │   │   └── register/
│   │   │       └── route.ts      # POST: Creates user, hashes password, returns JWT
│   │   └── history/
│   │       ├── [id]/
│   │       │   └── route.ts      # DELETE: Removes specific analysis entry
│   │       └── route.ts          # GET: Returns user history; DELETE: Purges history
│   ├── components/
│   │   ├── AnalysisHistory.tsx   # History list, filter pills, search input, item view
│   │   ├── AuthModal.tsx         # Sign in / Register modal with 1-click Demo button
│   │   ├── Navbar.tsx            # Minimalist header with theme toggle and user status
│   │   ├── SentimentResult.tsx   # Detailed output card (score bars, polarity, badges)
│   │   ├── SettingsModal.tsx     # Optional API keys and engine configuration modal
│   │   └── TweetComposer.tsx     # Centered tweet textarea with 280-char live counter
│   ├── globals.css               # Tailwind v4 dark variant, CSS tokens (zero purple/blue)
│   ├── layout.tsx                # Root layout with typography and metadata
│   └── page.tsx                  # Primary page orchestrating state, composer, and history
├── data/
│   └── db.json                   # In-memory JSON database local disk snapshot
├── lib/
│   ├── auth.ts                   # JWT token creation, verification, password hashing
│   ├── db.ts                     # In-memory JSON database singleton with /tmp Vercel fallback
│   ├── hf-analyzer.ts            # Hugging Face Inference API client (Twitter-RoBERTa)
│   ├── sentiment-engine.ts       # Native Twitter sentiment, emoji, negation & aspect engine
│   └── types.ts                  # Shared TypeScript data models and interfaces
├── .env.example                  # Environment configuration template
├── next.config.ts                # Next.js build and Turbopack configuration
├── package.json                  # Dependencies and script definitions
├── tsconfig.json                 # TypeScript compiler configuration
└── vercel.json                   # Vercel deployment and build settings
```

---

## In-Depth Implementation Details

### 1. Sentiment Analysis Engine

The native sentiment engine ([`lib/sentiment-engine.ts`](lib/sentiment-engine.ts)) is designed for social media linguistics:
- **Lexicon Scoring**: Words are indexed on a `-3.0` to `+3.0` scale.
- **Emoji Weights**: Emojis carry sentiment multipliers (e.g., `🚀` adds `+2.5` towards Optimism; `😡` adds `-2.8` towards Frustration).
- **Negation Lookback**: The parser inspects token $i-1$ and $i-2$ for negative anchors (`not`, `never`, `barely`, `can't`, `without`). If an anchor precedes a positive term, the valence is inverted; if it precedes `"bad"`, it is scored positively (`"not bad"` $\rightarrow$ satisfaction boost).
- **Normalized Polarity**:
  $$\text{Polarity} = \text{clamp}\left(\frac{\sum \text{Weights}}{\sqrt{\text{Tokens}} \times 2.5}, -1.0, 1.0\right)$$
- **Score Distribution**: Scores for positive, neutral, and negative are dynamically normalized to sum to `1.0`.

### 2. In-Memory JSON Database

Implemented in [`lib/db.ts`](lib/db.ts):
- **Singleton Persistence**: Uses `globalThis.__IN_MEMORY_DB__` so the data instance survives hot module replacement (HMR) during development.
- **Vercel & Serverless Compatibility**:
  - In local environments, writes state snapshots to `data/db.json`.
  - In serverless environments (where root `/var/task` is read-only), it gracefully routes disk snapshots to `/tmp/db.json` and defaults to memory storage, preventing `EROFS: read-only file system` errors.

### 3. Authentication & Security (JWT)

Implemented in [`lib/auth.ts`](lib/auth.ts):
- **Token Signing**: Uses `SignJWT` from `jose` with `HS256` encryption and a 7-day expiration window.
- **Password Salting**: `bcryptjs.hash(password, 10)` ensures user passwords are never stored in plain text.
- **Cookie Security**: Set with `httpOnly: true`, `sameSite: "lax"`, and `secure: true` in production.

### 4. History Persistence Rules

- **Unauthenticated (Guest)**:
  - `POST /api/analyze` performs analysis and returns the output with `saved: false`.
  - The client stores the entry only in React state (`useState`).
  - Calling `GET /api/history` returns an empty list (`[]`).
  - **On browser reload (`F5`)**, guest history resets to zero.
- **Authenticated (Signed Up)**:
  - `POST /api/analyze` verifies JWT, extracts `userId`, and writes the record to the in-memory database with `saved: true`.
  - Calling `GET /api/history` retrieves the user's specific saved analyses.
  - **On browser reload (`F5`)**, history persists and re-populates automatically.

---

## API Reference

### 1. `POST /api/analyze`
Analyzes a tweet's sentiment.

**Request Body:**
```json
{
  "text": "Just deployed to production and latency dropped 70%! Genuinely impressive work 🚀",
  "provider": "native"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "id": "anlz_1791987415172_8c724",
    "tweetText": "Just deployed to production and latency dropped 70%! Genuinely impressive work 🚀",
    "authorHandle": "@user",
    "sentiment": "POSITIVE",
    "confidence": 98,
    "scores": {
      "positive": 0.98,
      "neutral": 0.01,
      "negative": 0.01
    },
    "polarity": 0.88,
    "subjectivity": 0.75,
    "emotions": [
      { "name": "Joy / Excitement", "score": 0.92 }
    ],
    "aspects": [
      { "aspect": "Performance & Speed", "sentiment": "POSITIVE", "score": 0.95 }
    ],
    "provider": "native",
    "createdAt": "2026-10-14T14:16:55.172Z",
    "userId": "usr_demo_101"
  },
  "saved": true
}
```

---

### 2. `GET /api/history`
Fetches analysis history for the current session.

- **Headers**: Optional `Authorization: Bearer <token>` or session cookie.
- **Behavior**: Returns `analyses: []` if unauthenticated; returns user's historical records if authenticated.

---

### 3. `DELETE /api/history`
Clears all saved analyses for the authenticated user. Requires valid JWT.

---

### 4. `DELETE /api/history/:id`
Deletes an individual analysis record by ID.

---

### 5. `POST /api/auth/register`
Creates a new in-memory user account.

**Request Body:**
```json
{
  "username": "trader_jane",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

---

### 6. `POST /api/auth/login`
Authenticates user credentials and returns a JWT token along with an `HttpOnly` cookie.

**Request Body:**
```json
{
  "emailOrUsername": "jane@example.com",
  "password": "securepassword123"
}
```

---

### 7. `POST /api/auth/logout`
Clears the authentication cookie.

---

### 8. `GET /api/auth/me`
Validates the current session token and returns user details.

---

## Vercel Deployment Guide

Sentix is optimized for zero-configuration deployment to [Vercel](https://vercel.com):

### Option A: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from project root**:
   ```bash
   cd fst-mini-project
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project? **No**
   - Project name? **sentix-app**
   - In which directory is your code located? **`./`**
   - Auto-detected Next.js settings? **Yes**

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

---

### Option B: Deploy via GitHub / GitLab / Bitbucket

1. Push your repository to GitHub.
2. Visit [vercel.com/new](https://vercel.com/new).
3. Import the repository and select the **`fst-mini-project`** directory as root.
4. Framework Preset will be automatically detected as **Next.js**.
5. *(Optional)* In **Environment Variables**, define:
   - `JWT_SECRET`: Any random 32+ character string.
   - `HUGGINGFACE_API_KEY`: Optional Hugging Face token for RoBERTa model.
6. Click **Deploy**.

---

## Local Development & Setup

### Prerequisites
- Node.js `18.18.0` or later
- npm or pnpm or yarn

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd fst-mini-project
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production Locally
```bash
npm run build
npm run start
```

---

## Pre-Seeded Demo Credentials

To test authenticated persistence without manual registration:
- **Email / Username**: `demo@example.com` or `demo_trader`
- **Password**: `demo123`

*(Alternatively, click the **"Instant Test: Demo Account"** button inside the Sign In modal).*

---

## License

This project is licensed under the MIT License.
