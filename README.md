# Law · Economics · Finance — LEF OS

A 4-month founder's curriculum in Nigerian and global **Law, Economics, and Finance**, shipped as a mobile-first, installable Progressive Web App (PWA).

**Created by:** Michael Ojekunle ([michojekunle](https://github.com/michojekunle))

## Core Features

- **Public Roadmap & Journal**: 122 calendar days (111 study days) spanning 3 domains, completely learned in public.
- **Offline PWA Support**: Installable on iOS/Android/Desktop with comprehensive offline capabilities and service worker caching.
- **Interactive Onboarding**: Guided tour system to help new users navigate the curriculum dashboard.
- **Push Notifications & Reminders**: Email + in-app + web push notifications with custom reminder schedules.
- **AI Study Companion**: Integrated "LEF Counsel" AI companion powered by Gemini.
- **Daily Tracker & Notes**: Per-day markdown notes, an open question stack, bookmarks, and public reactions.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Middleware)
- **Styling**: Tailwind CSS (Dark Editorial Design)
- **Database & Auth**: Supabase (PostgreSQL, RLS, Edge Functions, OAuth)
- **Offline/PWA**: `next-pwa`
- **Notifications**: Web-Push + Resend
- **AI**: Google Gemini API

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/michojekunle/lef-os.git
   cd lef-os
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase keys (and optional Gemini/Resend keys):

   ```bash
   cp .env.example .env.local
   ```

4. **Run the local development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Setup

This project uses Supabase. To initialize the database schema, ensure you have the Supabase CLI installed and linked to your project, then run:

```bash
npm run db:push
```

## License

This project is licensed under the [MIT License](LICENSE). Curriculum content is copyright © Michael Ojekunle.
