# ✦ Fillr — AI Form Filler

> Fill any form field with AI using your resume. Works on job applications, scholarships, visa forms — anywhere on the web.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Chrome Extension](https://img.shields.io/badge/Chrome-MV3-green)

## What it does

Fillr is a Chrome extension + web dashboard that watches any form on any website. When you focus a field, a button appears. Click it — the AI reads the question, finds the relevant section of your resume, and streams an answer directly into the field in seconds.

**Your resume never leaves your device.** It's parsed and stored in `chrome.storage.local`. Only the question + relevant resume snippet is sent to the AI API.

## Tech stack

| Layer | Technology |
|---|---|
| Extension UI | React + TypeScript + Tailwind + Shadow DOM |
| Extension state | Zustand |
| Extension build | Vite + CRXJS |
| AI | OpenRouter API (streaming SSE) |
| PDF parsing | pdf.js (client-side) |
| Web dashboard | Next.js 14 App Router |
| Dashboard UI | shadcn/ui + Tailwind |
| Auth | Clerk |
| Database | Supabase (Postgres) |

## Architecture

This project is a **monorepo** with three packages:

```
fillr/
├── packages/types/     # Shared TypeScript types (extension + dashboard)
├── extension/          # Chrome extension (MV3)
│   ├── src/background/ # Service Worker — API calls, caching, message routing
│   ├── src/content/    # Content Script — DOM watching, button injection
│   └── src/popup/      # Popup UI — settings, resume upload
└── dashboard/          # Next.js 14 web dashboard
    ├── app/dashboard/  # Protected routes (Clerk auth)
    └── lib/supabase/   # DB client with RLS
```

Key system design decisions:
- **Shadow DOM** for content script UI — CSS isolation from host page
- **Streaming SSE** from OpenRouter — answers appear word-by-word
- **Resume chunking** — only relevant sections sent to AI (RAG pattern)
- **LRU/LFU cache eviction** — answer cache managed at 8MB soft limit
- **Row Level Security** in Supabase — data access enforced at DB level

## Getting started

### Prerequisites
- Node 18+
- A [Clerk](https://clerk.com) account (free)
- A [Supabase](https://supabase.com) project (free)
- An [OpenRouter](https://openrouter.ai) API key (users bring their own)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/fillr
cd fillr
npm install
```

### 2. Set up the database

In your Supabase project → SQL Editor, paste and run the contents of `dashboard/supabase-schema.sql`.

### 3. Configure environment

```bash
cp dashboard/.env.example dashboard/.env.local
# Fill in your Clerk and Supabase keys
```

### 4. Run the dashboard

```bash
npm run dev:dashboard
# → http://localhost:3000
```

### 5. Build and load the extension

```bash
npm run build:extension
# Load extension/dist/ in chrome://extensions → Developer mode → Load unpacked
```

## System design

This project was built as a deliberate **system design learning exercise**, documenting every architectural decision from requirements through scale. Read the decisions:

- **Phase 1** — Requirements & scope (functional vs non-functional, capacity estimation)
- **Phase 2** — High-level design (extension anatomy, message passing, streaming)
- **Phase 3** — Data design (chunking, storage tiers, cache invalidation, versioning)
- **Phase 4** — Low-level design (MutationObserver, prompt engineering, Shadow DOM)
- **Phase 5** — Scale & production (rate limiting, N+1 queries, security, cost model)

## License

MIT
