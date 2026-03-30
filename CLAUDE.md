# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RainbowMap is a Next.js webapp for sharing geolocated rainbow photos on an interactive map. Users upload photos with metadata (GPS, compass direction, date/time), view them on a Leaflet map, and vote on favorites. The UI follows the "Ethereal Spectrum" design system — glassmorphism, no borders, gradient CTAs, airy spacing.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Backend/DB/Auth/Storage**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Map**: Leaflet + react-leaflet + react-leaflet-cluster (dynamic import, no SSR)
- **Styling**: Tailwind CSS v4 (config in `globals.css` via `@theme inline`, no `tailwind.config.ts`)
- **Font**: Plus Jakarta Sans + Material Symbols Outlined icons
- **Image processing**: exifr (EXIF extraction), browser-image-compression (client-side)

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Navigation Flow
Bottom nav with 5 tabs: Home (feed) → Explore (map) → Upload (+) → Contest (photo of month) → Profile. Auth pages hide the bottom nav. Upload and Profile redirect to `/auth/login` if not authenticated.

### Supabase Integration
- `src/lib/supabase/client.ts` — browser client (used in "use client" components)
- `src/lib/supabase/server.ts` — server client (used in Server Components and Route Handlers)
- `src/lib/supabase/middleware.ts` — session refresh middleware
- `src/middleware.ts` — Next.js middleware that calls the session refresh

All DB access goes through Supabase client with RLS policies enforcing authorization. Never bypass RLS or use the service role key in client-facing code.

### Database Schema
Three tables: `profiles` (extends auth.users), `photos` (with geospatial index via PostGIS), `votes` (composite PK for one-vote-per-user). Vote counts are maintained by a SQL trigger on the `votes` table. Schema lives in `supabase/migrations/`.

### Map Components
Leaflet must be loaded client-side only. `MapWrapper.tsx` uses `next/dynamic` with `ssr: false` to import `Map.tsx`. Never import leaflet or react-leaflet in Server Components. Same pattern for `LocationPicker.tsx` in the upload form.

### Image Upload Flow
1. Client extracts EXIF (GPS, direction, date) via `exifr`
2. Client compresses to full (1MB max) + thumbnail (50KB max) via `browser-image-compression`
3. Both uploaded to Supabase Storage under `{userId}/{timestamp}/`
4. Photo record inserted with public URLs

### Design System ("Ethereal Spectrum")
- **No-Line Rule**: Never use 1px borders for sectioning. Use background color shifts between surface levels.
- **Glassmorphism**: Use `.glass-card`, `.glass-panel`, `.glass-nav` classes for floating elements.
- **Gradient CTAs**: Primary buttons use `.bg-vibrant-aura` (primary→tertiary at 135deg). Shape: `rounded-full`.
- **Surface nesting**: `background` → `surface-container-low` → `surface-container` → `surface-container-highest`.
- **Icons**: Material Symbols Outlined with `<span class="material-symbols-outlined">icon_name</span>`. Use `.filled` class or `fontVariationSettings: "'FILL' 1"` for active states.
- **Typography**: Labels use `text-[10px] font-bold uppercase tracking-widest`. Headers use `font-extrabold tracking-tight`.
- **Shadows**: Use `.shadow-ambient` (soft 12px blur). Never use harsh/dark shadows.

### Environment Variables
Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Key Conventions

- Italian UI text throughout the app
- All pages use the App Router (`src/app/`) with async Server Components where possible
- Client components are marked with "use client" and use the browser Supabase client
- Photos are served as thumbnails on the map/lists, full-size only on detail page (bandwidth optimization)
- Auth is email/password for MVP; social OAuth planned for later phases
- `useSearchParams()` must always be wrapped in `<Suspense>` boundaries
