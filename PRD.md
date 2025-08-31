# Habit Harbor – Product Requirements Document (PRD)

## 1. Overview
Habit Harbor is a minimalist **offline-first habit tracker** that works on desktop and mobile browsers as a PWA (Progressive Web App). 
It helps users build and maintain daily habits with **simplicity, offline reliability, and optional cloud sync**.

## 2. Goals
- Create a lightweight, installable PWA that works fully offline.
- Provide a clean and engaging UI that makes habit tracking frictionless.
- Allow syncing across devices via Supabase (optional).
- Deliver a portfolio-ready showcase of **frontend, PWA, and offline-first design**.

## 3. Target Users
- People who want a **simple daily habit tracker** (not bloated like Notion).
- Users in low-connectivity environments (offline-first is a selling point).
- Developers/managers reviewing the project as a **portfolio demo**.

## 4. Key Features
### Core (MVP)
- Add new habits (text input, e.g., “Drink water”).
- Daily check-off system (✔ for today).
- Local persistence via IndexedDB (localForage).
- Visual streak tracker (Chart.js).
- PWA support (installable, offline-ready).

### Optional (Phase 2+)
- Supabase cloud sync.
- Notifications (reminders).
- Habit categories (Health, Work, etc.).
- Export/import data (JSON/CSV).

## 5. User Stories
- *As a user, I can add habits so I can track them daily.*
- *As a user, I can check off a habit each day so I can maintain streaks.*
- *As a user, I can see streak charts so I stay motivated.*
- *As a user, I can install the app to my phone so I access it easily.*
- *As a user, I can use the app offline so I never lose access.*

## 6. Success Metrics
- ✅ MVP runs offline and installs as a PWA.
- ✅ Data persists between sessions without internet.
- ✅ At least 3 habits can be tracked simultaneously.
- ✅ Charts render streaks with clear UI.

## 7. Tech Stack
- **Frontend:** React + Vite + Tailwind (UI).
- **Storage:** localForage (IndexedDB).
- **Charts:** Chart.js.
- **Optional sync:** Supabase.
- **PWA:** Service Worker + manifest.

## 8. Risks & Constraints
- Offline sync conflict handling (future).
- Push notifications may be platform-limited.
- Small-scope project (goal: showcase, not full app).

## 9. Deliverables
- ✅ GitHub repo with clean README, screenshots, and MIT license.
- ✅ Deployable demo on Cloudflare Pages or Netlify.
- ✅ PRD.md + CHECKLIST.md included in repo.
