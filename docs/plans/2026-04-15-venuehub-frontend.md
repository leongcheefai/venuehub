# VenueHub Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Vite + React + TypeScript single-page app for VenueHub: a public landing + venue details page, the 5-step booking request flow, and the admin dashboard (login, stats, bookings table, approve/reject modal). The frontend reads from Supabase directly for all public and admin reads under RLS, and calls the backend only for `POST /api/bookings` and `PATCH /api/admin/bookings/:id`.

**Architecture:** Vite + React 19 + TS, Tailwind + shadcn/ui, React Router v6 with a protected admin subtree, TanStack Query for server state, React Hook Form + Zod for forms, the booking flow uses Context + useReducer (not Query) for its cross-step state. Feature-based folder structure mirrors product surfaces, not technical layers.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, React Router v6, TanStack Query, React Hook Form, Zod, date-fns, `@supabase/supabase-js`, Lucide icons, Vitest + React Testing Library.

**Prerequisites:**
- Phase I1 of [2026-04-15-venuehub-integration.md](2026-04-15-venuehub-integration.md) — Supabase project + schema + seed + admin user + `apps/frontend/.env`.
- The backend plan does not need to be complete before starting, but Phase F5 (booking submission) and Phase F7 (admin approve/reject) cannot be verified end-to-end until the backend endpoints are live.
- `apps/frontend` already scaffolded with Vite + React 19 + TS. `@supabase/supabase-js` installed. `apps/frontend/src/lib/supabase.ts` exports the anon client.

**API contract source of truth:** [2026-04-15-venuehub-integration.md § Phase I2](2026-04-15-venuehub-integration.md#phase-i2-api-contract-source-of-truth).

---

## File Structure

```
apps/frontend/src/
  main.tsx                          # bootstrap providers
  App.tsx                           # routes tree
  index.css                         # Tailwind @theme tokens
  lib/
    supabase.ts                     # [exists] anon client
    env.ts                          # typed import.meta.env
    queryClient.ts                  # shared QueryClient
  shared/
    components/
      ui/                           # shadcn primitives
      PublicLayout.tsx              # navbar + outlet + footer
      AdminLayout.tsx               # sidebar + outlet + sign out
      Navbar.tsx
      Footer.tsx
      ErrorBoundary.tsx
    hooks/
      useSession.ts                 # subscribes to Supabase auth
      useAdminCheck.ts              # is current user in admin_user?
  features/
    venue/
      api.ts                        # fetchVenue, fetchTimeSlots, fetchUnavailableSlots
      LandingPage.tsx
      VenueDetailsPage.tsx
      components/
        HeroSection.tsx
        HighlightsGrid.tsx
        PhotoGallery.tsx
        AmenitiesList.tsx
        AvailabilitySidebar.tsx
    booking/
      BookingPage.tsx               # stepper + step switch
      BookingProvider.tsx           # Context + useReducer
      reducer.ts                    # pure reducer
      reducer.test.ts
      schema.ts                     # Zod schemas for details form
      api.ts                        # submitBooking (POST /api/bookings)
      components/
        Stepper.tsx
      steps/
        DateStep.tsx
        TimeStep.tsx
        DetailsStep.tsx
        ReviewStep.tsx
        ConfirmationStep.tsx
    admin/
      api.ts                        # listBookings, fetchStats, updateBookingStatus
      AdminLoginPage.tsx
      AdminDashboardPage.tsx
      RequireAdmin.tsx              # route guard
      components/
        StatsRow.tsx
        FilterBar.tsx
        StatusBadge.tsx
        BookingsTable.tsx
        BookingDetailModal.tsx
```

---

## Phase F0: Foundation

### Task F0.1: Tailwind v4 + design tokens

**Files:**
- Modify: `apps/frontend/package.json`, `apps/frontend/vite.config.ts`, `apps/frontend/tsconfig.app.json`
- Modify: `apps/frontend/src/index.css`
- Delete: `apps/frontend/src/App.css`

- [ ] **Step 1: Install Tailwind + utilities**

```bash
cd apps/frontend
npm install -D tailwindcss @tailwindcss/vite
npm install clsx tailwind-merge class-variance-authority lucide-react
```

- [ ] **Step 2: Replace `src/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-background: #fafaf9;
  --color-foreground: #1c1917;
  --color-accent: #0f766e;
  --color-accent-foreground: #ffffff;
  --color-muted: #f5f5f4;
  --color-muted-foreground: #57534e;
  --color-border: #e7e5e4;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

html, body, #root { height: 100%; }
body {
  font-family: var(--font-sans);
  background: var(--color-background);
  color: var(--color-foreground);
}
```

- [ ] **Step 3: Update vite.config.ts**

```typescript
// apps/frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 4: Add `@/*` path alias to `tsconfig.app.json`**

Under `compilerOptions`, add:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

- [ ] **Step 5: Replace App.tsx, delete App.css**

```tsx
// apps/frontend/src/App.tsx
export default function App() {
  return (
    <div className="min-h-screen grid place-items-center">
      <h1 className="text-3xl font-semibold">VenueHub</h1>
    </div>
  );
}
```

```bash
rm src/App.css
```

Remove `import './App.css'` from `main.tsx` if present.

- [ ] **Step 6: Run dev, verify Tailwind is wired**

```bash
npm run dev
```

Open `http://localhost:5173`. A centered bold "VenueHub" heading should render.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(frontend): tailwind v4 + design tokens"
```

### Task F0.2: shadcn/ui init + components

- [ ] **Step 1: Run shadcn init**

```bash
cd apps/frontend
npx shadcn@latest init
```

Accept the defaults, pick "Slate" base color, confirm the `src/` path, confirm `@/*` alias.

- [ ] **Step 2: Add all components the plan uses**

```bash
npx shadcn@latest add button input label select textarea card dialog badge table toast sonner calendar skeleton
```

- [ ] **Step 3: Verify the install**

Check that `src/components/ui/button.tsx` (and friends) exist and that `App.tsx` can still render.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(frontend): shadcn/ui primitives"
```

### Task F0.3: Router + TanStack Query + env + session hook

**Files:**
- Modify: `apps/frontend/package.json`
- Create: `apps/frontend/src/lib/env.ts`, `queryClient.ts`, `apps/frontend/src/shared/hooks/useSession.ts`
- Modify: `apps/frontend/src/main.tsx`, `apps/frontend/src/App.tsx`

- [ ] **Step 1: Install**

```bash
cd apps/frontend
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools react-hook-form @hookform/resolvers zod date-fns
```

- [ ] **Step 2: env.ts**

```typescript
// apps/frontend/src/lib/env.ts
const required = (key: string, value: string | undefined) => {
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
};
```

Also append `VITE_API_URL=http://localhost:3000` to `apps/frontend/.env.example` if missing.

- [ ] **Step 3: queryClient.ts**

```typescript
// apps/frontend/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});
```

- [ ] **Step 4: useSession hook**

```typescript
// apps/frontend/src/shared/hooks/useSession.ts
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
```

- [ ] **Step 5: main.tsx**

```tsx
// apps/frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/queryClient';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 6: App.tsx with placeholder routes**

```tsx
// apps/frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8"><h1 className="text-2xl">{title}</h1></div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Landing" />} />
      <Route path="/venue" element={<Placeholder title="Venue Details" />} />
      <Route path="/book" element={<Placeholder title="Book" />} />
      <Route path="/admin/login" element={<Placeholder title="Admin Login" />} />
      <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}
```

- [ ] **Step 7: Verify**

```bash
npm run dev
```

Visit `/`, `/venue`, `/book`, `/admin`, `/admin/login`, `/anything` — all render placeholder headings.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(frontend): router, query, env, session hook"
```

### Task F0.4: Vitest + React Testing Library

**Files:**
- Modify: `apps/frontend/package.json`
- Create: `apps/frontend/vitest.config.ts`, `apps/frontend/src/test/setup.ts`

- [ ] **Step 1: Install**

```bash
cd apps/frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: vitest.config.ts**

```typescript
// apps/frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

- [ ] **Step 3: Test setup**

```typescript
// apps/frontend/src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add scripts**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke test**

```tsx
// apps/frontend/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

it('renders landing placeholder', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /landing/i })).toBeInTheDocument();
});
```

- [ ] **Step 6: Run, delete, commit**

```bash
npm test
rm src/App.test.tsx
git add .
git commit -m "chore(frontend): vitest + testing library"
```

---

## Phase F1: Public layout + venue data

### Task F1.1: Venue data hooks (direct Supabase)

**Files:**
- Create: `apps/frontend/src/features/venue/api.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/frontend/src/features/venue/api.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  amenities: string[];
  images: string[];
  pricing_info: { tiers?: { name: string; price: string }[] } | null;
}

export interface TimeSlot {
  id: string;
  venue_id: string;
  label: string;
  start_time: string;
  end_time: string;
}

export async function fetchVenue(): Promise<Venue> {
  // Single-venue MVP: grab the first venue row.
  const { data, error } = await supabase
    .from('venue')
    .select('*')
    .limit(1)
    .single();
  if (error) throw error;
  return data as Venue;
}

export async function fetchTimeSlots(venueId: string): Promise<TimeSlot[]> {
  const { data, error } = await supabase
    .from('time_slot')
    .select('*')
    .eq('venue_id', venueId)
    .order('start_time');
  if (error) throw error;
  return data as TimeSlot[];
}

export async function fetchUnavailableSlots(venueId: string, date: string): Promise<string[]> {
  // Returns time_slot_ids that are booked (PENDING or APPROVED) for that date.
  const { data, error } = await supabase
    .from('booking')
    .select('time_slot_id, status')
    .eq('venue_id', venueId)
    .eq('date', date)
    .neq('status', 'REJECTED');
  if (error) throw error;
  return (data ?? []).map((r) => r.time_slot_id as string);
}

export function useVenue() {
  return useQuery({ queryKey: ['venue'], queryFn: fetchVenue });
}

export function useTimeSlots(venueId?: string) {
  return useQuery({
    queryKey: ['timeSlots', venueId],
    queryFn: () => fetchTimeSlots(venueId!),
    enabled: !!venueId,
  });
}

export function useUnavailableSlots(venueId?: string, date?: string) {
  return useQuery({
    queryKey: ['unavailable', venueId, date],
    queryFn: () => fetchUnavailableSlots(venueId!, date!),
    enabled: !!venueId && !!date,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/venue/api.ts
git commit -m "feat(frontend): venue data hooks"
```

### Task F1.2: Public layout shell

**Files:**
- Create: `apps/frontend/src/shared/components/Navbar.tsx`, `Footer.tsx`, `PublicLayout.tsx`

- [ ] **Step 1: Navbar**

```tsx
// apps/frontend/src/shared/components/Navbar.tsx
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  }`;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg tracking-tight">VenueHub</Link>
        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/venue" className={navClass}>Details</NavLink>
          <Button asChild><Link to="/book">Book Now</Link></Button>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Footer**

```tsx
// apps/frontend/src/shared/components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-col sm:flex-row gap-4 justify-between">
        <div>© {new Date().getFullYear()} VenueHub. All rights reserved.</div>
        <div>Find your space, book your moment.</div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Layout wrapper**

```tsx
// apps/frontend/src/shared/components/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/shared/components
git commit -m "feat(frontend): public layout shell"
```

---

## Phase F2: Landing page + venue details page

### Task F2.1: Landing page sections + composition

**Files:**
- Create: `apps/frontend/src/features/venue/components/HeroSection.tsx`, `HighlightsGrid.tsx`, `PhotoGallery.tsx`
- Create: `apps/frontend/src/features/venue/LandingPage.tsx`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: HeroSection**

```tsx
// apps/frontend/src/features/venue/components/HeroSection.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HeroSection({ name, imageUrl }: { name: string; imageUrl: string }) {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-16 text-white">
        <p className="text-sm tracking-widest uppercase opacity-80">Venue</p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mt-2">{name}</h1>
        <p className="mt-3 max-w-xl text-lg opacity-90">Find your space, book your moment.</p>
        <Button asChild size="lg" className="mt-8 w-fit">
          <Link to="/book">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: HighlightsGrid**

```tsx
// apps/frontend/src/features/venue/components/HighlightsGrid.tsx
import { Users, MapPin, Sparkles, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  capacity: number;
  amenitiesCount: number;
  address: string;
  pricingLabel: string;
}

export function HighlightsGrid({ capacity, amenitiesCount, address, pricingLabel }: Props) {
  const items = [
    { icon: Users, label: 'Capacity', value: `${capacity} guests` },
    { icon: Sparkles, label: 'Amenities', value: `${amenitiesCount} included` },
    { icon: MapPin, label: 'Location', value: address },
    { icon: DollarSign, label: 'Pricing', value: pricingLabel },
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, label, value }) => (
        <Card key={label}>
          <CardContent className="p-6">
            <Icon className="h-5 w-5 text-accent" />
            <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
```

- [ ] **Step 3: PhotoGallery**

```tsx
// apps/frontend/src/features/venue/components/PhotoGallery.tsx
export function PhotoGallery({ images }: { images: string[] }) {
  return (
    <section className="max-w-6xl mx-auto px-6 mt-24">
      <h2 className="text-3xl font-semibold tracking-tight">The Space</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.slice(0, 6).map((src) => (
          <img key={src} src={src} alt="" loading="lazy"
            className="aspect-[4/3] w-full object-cover rounded-lg" />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: LandingPage**

```tsx
// apps/frontend/src/features/venue/LandingPage.tsx
import { useVenue } from './api';
import { HeroSection } from './components/HeroSection';
import { HighlightsGrid } from './components/HighlightsGrid';
import { PhotoGallery } from './components/PhotoGallery';
import { Skeleton } from '@/components/ui/skeleton';

export function LandingPage() {
  const { data: venue, isLoading, error } = useVenue();

  if (isLoading) return <div className="p-8"><Skeleton className="h-[70vh] w-full" /></div>;
  if (error || !venue) return <div className="p-8 text-red-600">Failed to load venue.</div>;

  const pricingLabel = venue.pricing_info?.tiers?.[0]?.price
    ? `from ${venue.pricing_info.tiers[0].price}`
    : 'On request';

  return (
    <>
      <HeroSection name={venue.name} imageUrl={venue.images[0]} />
      <HighlightsGrid
        capacity={venue.capacity}
        amenitiesCount={venue.amenities.length}
        address={venue.address}
        pricingLabel={pricingLabel}
      />
      <PhotoGallery images={venue.images} />
    </>
  );
}
```

- [ ] **Step 5: Mount in App.tsx**

```tsx
// apps/frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/shared/components/PublicLayout';
import { LandingPage } from '@/features/venue/LandingPage';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8"><h1 className="text-2xl">{title}</h1></div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/venue" element={<Placeholder title="Venue Details" />} />
        <Route path="/book" element={<Placeholder title="Book" />} />
      </Route>
      <Route path="/admin/login" element={<Placeholder title="Admin Login" />} />
      <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}
```

- [ ] **Step 6: Verify**

`npm run dev`. Open `/`. Hero should fill the viewport with a seeded image, highlights cards pop above the fold, gallery grid renders. Check 375px mobile view.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(frontend): landing page"
```

### Task F2.2: Venue details page

**Files:**
- Create: `apps/frontend/src/features/venue/components/AmenitiesList.tsx`, `AvailabilitySidebar.tsx`
- Create: `apps/frontend/src/features/venue/VenueDetailsPage.tsx`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: AmenitiesList**

```tsx
// apps/frontend/src/features/venue/components/AmenitiesList.tsx
import { Check } from 'lucide-react';

export function AmenitiesList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-3 text-sm">
          <span className="inline-grid place-items-center h-8 w-8 rounded-full bg-accent/10 text-accent">
            <Check className="h-4 w-4" />
          </span>
          {a}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: AvailabilitySidebar**

```tsx
// apps/frontend/src/features/venue/components/AvailabilitySidebar.tsx
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

export function AvailabilitySidebar() {
  return (
    <aside className="md:sticky md:top-24">
      <Card>
        <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Calendar mode="single" className="rounded-md border" />
          <Button asChild className="w-full" size="lg">
            <Link to="/book">Book This Venue</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
```

- [ ] **Step 3: VenueDetailsPage**

```tsx
// apps/frontend/src/features/venue/VenueDetailsPage.tsx
import { useVenue } from './api';
import { AmenitiesList } from './components/AmenitiesList';
import { AvailabilitySidebar } from './components/AvailabilitySidebar';
import { PhotoGallery } from './components/PhotoGallery';
import { Skeleton } from '@/components/ui/skeleton';

export function VenueDetailsPage() {
  const { data: venue, isLoading } = useVenue();
  if (isLoading || !venue) return <Skeleton className="h-96" />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{venue.name}</h1>
      <p className="mt-2 text-muted-foreground">{venue.address}</p>
      <div className="mt-10 grid md:grid-cols-[1fr_360px] gap-12">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold">About</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{venue.description}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">Amenities</h2>
            <div className="mt-4"><AmenitiesList amenities={venue.amenities} /></div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">Capacity</h2>
            <p className="mt-3">Up to <strong>{venue.capacity}</strong> guests</p>
          </section>
          {venue.pricing_info?.tiers && (
            <section>
              <h2 className="text-2xl font-semibold">Pricing</h2>
              <ul className="mt-4 divide-y border rounded-lg overflow-hidden">
                {venue.pricing_info.tiers.map((t) => (
                  <li key={t.name} className="flex justify-between p-4">
                    <span>{t.name}</span>
                    <strong>{t.price}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <AvailabilitySidebar />
      </div>
      <PhotoGallery images={venue.images} />
    </div>
  );
}
```

- [ ] **Step 4: Mount**

In `App.tsx`, replace the `/venue` placeholder with `<VenueDetailsPage />` (keep it inside `PublicLayout`):
```tsx
import { VenueDetailsPage } from '@/features/venue/VenueDetailsPage';
// ...
<Route path="/venue" element={<VenueDetailsPage />} />
```

- [ ] **Step 5: Verify**

`/venue` renders two-column layout on desktop, stacks on mobile.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(frontend): venue details page"
```

---

## Phase F3: Booking flow state (reducer + context)

### Task F3.1: Booking schemas

**Files:**
- Create: `apps/frontend/src/features/booking/schema.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/frontend/src/features/booking/schema.ts
import { z } from 'zod';

export const eventTypeEnum = z.enum([
  'WEDDING', 'CORPORATE', 'BIRTHDAY', 'WORKSHOP', 'COMMUNITY', 'OTHER',
]);
export type EventType = z.infer<typeof eventTypeEnum>;

export const detailsSchema = z.object({
  fullName: z.string().trim().min(1, 'Required').max(120),
  email: z.string().email('Enter a valid email'),
  phone: z.string().trim().min(6, 'Enter a valid phone'),
  eventType: eventTypeEnum,
  guestCount: z.coerce.number().int().positive('Must be at least 1'),
  specialRequests: z.string().max(2000).optional(),
});
export type DetailsValues = z.infer<typeof detailsSchema>;

export const eventTypeLabels: Record<EventType, string> = {
  WEDDING: 'Wedding',
  CORPORATE: 'Corporate',
  BIRTHDAY: 'Birthday',
  WORKSHOP: 'Workshop',
  COMMUNITY: 'Community',
  OTHER: 'Other',
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/booking/schema.ts
git commit -m "feat(frontend): booking schemas"
```

### Task F3.2: Booking reducer (TDD)

**Files:**
- Create: `apps/frontend/src/features/booking/reducer.test.ts`
- Create: `apps/frontend/src/features/booking/reducer.ts`

- [ ] **Step 1: Failing tests**

```typescript
// apps/frontend/src/features/booking/reducer.test.ts
import { describe, it, expect } from 'vitest';
import { bookingReducer, initialBookingState } from './reducer';

describe('bookingReducer', () => {
  it('starts at step 1 with empty state', () => {
    expect(initialBookingState.step).toBe(1);
    expect(initialBookingState.date).toBeUndefined();
  });

  it('SET_DATE moves to step 2', () => {
    const s = bookingReducer(initialBookingState, { type: 'SET_DATE', date: '2099-01-01' });
    expect(s.date).toBe('2099-01-01');
    expect(s.step).toBe(2);
  });

  it('changing date clears the previously chosen time slot', () => {
    const s1 = bookingReducer(initialBookingState, { type: 'SET_DATE', date: '2099-01-01' });
    const s2 = bookingReducer(s1, { type: 'SET_TIME_SLOT', timeSlotId: 'a', timeSlotLabel: 'A' });
    const s3 = bookingReducer(s2, { type: 'SET_DATE', date: '2099-01-02' });
    expect(s3.timeSlotId).toBeUndefined();
    expect(s3.step).toBe(2);
  });

  it('SET_TIME_SLOT moves to step 3', () => {
    const s = bookingReducer(
      { ...initialBookingState, step: 2, date: '2099-01-01' },
      { type: 'SET_TIME_SLOT', timeSlotId: 'a', timeSlotLabel: 'Morning' },
    );
    expect(s.timeSlotId).toBe('a');
    expect(s.step).toBe(3);
  });

  it('SET_DETAILS moves to step 4', () => {
    const s = bookingReducer(initialBookingState, {
      type: 'SET_DETAILS',
      details: { fullName: 'A', email: 'a@b.co', phone: '555555', eventType: 'OTHER', guestCount: 5 },
    });
    expect(s.details?.fullName).toBe('A');
    expect(s.step).toBe(4);
  });

  it('GO_TO jumps to a specific step without clearing data', () => {
    const s = bookingReducer(
      { ...initialBookingState, step: 4, date: '2099-01-01' },
      { type: 'GO_TO', step: 1 },
    );
    expect(s.step).toBe(1);
    expect(s.date).toBe('2099-01-01');
  });

  it('CONFIRM sets reference and moves to step 5', () => {
    const s = bookingReducer(initialBookingState, {
      type: 'CONFIRM', referenceNumber: 'VH-20260415-001',
    });
    expect(s.referenceNumber).toBe('VH-20260415-001');
    expect(s.step).toBe(5);
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
npm test
```

Expected: module not found.

- [ ] **Step 3: Implement reducer**

```typescript
// apps/frontend/src/features/booking/reducer.ts
import type { DetailsValues } from './schema';

export interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  date?: string;
  timeSlotId?: string;
  timeSlotLabel?: string;
  details?: DetailsValues;
  referenceNumber?: string;
}

export const initialBookingState: BookingState = { step: 1 };

export type BookingAction =
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_TIME_SLOT'; timeSlotId: string; timeSlotLabel: string }
  | { type: 'SET_DETAILS'; details: DetailsValues }
  | { type: 'GO_TO'; step: BookingState['step'] }
  | { type: 'CONFIRM'; referenceNumber: string }
  | { type: 'RESET' };

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_DATE':
      return state.date === action.date
        ? { ...state, step: 2 }
        : { ...state, date: action.date, timeSlotId: undefined, timeSlotLabel: undefined, step: 2 };
    case 'SET_TIME_SLOT':
      return { ...state, timeSlotId: action.timeSlotId, timeSlotLabel: action.timeSlotLabel, step: 3 };
    case 'SET_DETAILS':
      return { ...state, details: action.details, step: 4 };
    case 'GO_TO':
      return { ...state, step: action.step };
    case 'CONFIRM':
      return { ...state, referenceNumber: action.referenceNumber, step: 5 };
    case 'RESET':
      return initialBookingState;
  }
}
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test
```

Expected: 7 passing.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(frontend): booking reducer"
```

### Task F3.3: BookingProvider context

**Files:**
- Create: `apps/frontend/src/features/booking/BookingProvider.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/frontend/src/features/booking/BookingProvider.tsx
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { bookingReducer, initialBookingState, type BookingState, type BookingAction } from './reducer';

interface Ctx {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

const BookingCtx = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  return <BookingCtx.Provider value={{ state, dispatch }}>{children}</BookingCtx.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/booking/BookingProvider.tsx
git commit -m "feat(frontend): booking context"
```

---

## Phase F4: Booking flow UI

### Task F4.1: Stepper + page shell

**Files:**
- Create: `apps/frontend/src/features/booking/components/Stepper.tsx`
- Create: `apps/frontend/src/features/booking/BookingPage.tsx`
- Create placeholder files for each step under `apps/frontend/src/features/booking/steps/`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: Stepper**

```tsx
// apps/frontend/src/features/booking/components/Stepper.tsx
import { Check } from 'lucide-react';
import { useBooking } from '../BookingProvider';

const labels = ['Date', 'Time', 'Details', 'Review', 'Done'];

export function Stepper() {
  const { state } = useBooking();
  return (
    <ol className="flex items-center gap-2 text-xs">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = state.step === n;
        const done = state.step > n;
        return (
          <li key={label} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full grid place-items-center border
              ${done ? 'bg-accent text-accent-foreground border-accent' : ''}
              ${active ? 'border-accent text-accent' : ''}
              ${!active && !done ? 'border-border text-muted-foreground' : ''}`}>
              {done ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={active ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
            {i < labels.length - 1 && <span className="w-6 h-px bg-border mx-1" />}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Step placeholders (so imports resolve)**

Create these five files with the contents shown:

```tsx
// apps/frontend/src/features/booking/steps/DateStep.tsx
export function DateStep() { return <div>TODO: DateStep</div>; }
```

```tsx
// apps/frontend/src/features/booking/steps/TimeStep.tsx
export function TimeStep() { return <div>TODO: TimeStep</div>; }
```

```tsx
// apps/frontend/src/features/booking/steps/DetailsStep.tsx
export function DetailsStep() { return <div>TODO: DetailsStep</div>; }
```

```tsx
// apps/frontend/src/features/booking/steps/ReviewStep.tsx
export function ReviewStep() { return <div>TODO: ReviewStep</div>; }
```

```tsx
// apps/frontend/src/features/booking/steps/ConfirmationStep.tsx
export function ConfirmationStep() { return <div>TODO: ConfirmationStep</div>; }
```

These are filled in by the next tasks.

- [ ] **Step 3: BookingPage shell**

```tsx
// apps/frontend/src/features/booking/BookingPage.tsx
import { BookingProvider, useBooking } from './BookingProvider';
import { Stepper } from './components/Stepper';
import { DateStep } from './steps/DateStep';
import { TimeStep } from './steps/TimeStep';
import { DetailsStep } from './steps/DetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

function StepBody() {
  const { state } = useBooking();
  switch (state.step) {
    case 1: return <DateStep />;
    case 2: return <TimeStep />;
    case 3: return <DetailsStep />;
    case 4: return <ReviewStep />;
    case 5: return <ConfirmationStep />;
  }
}

export function BookingPage() {
  return (
    <BookingProvider>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10"><Stepper /></div>
        <StepBody />
      </div>
    </BookingProvider>
  );
}
```

- [ ] **Step 4: Mount /book in App.tsx**

```tsx
import { BookingPage } from '@/features/booking/BookingPage';
// ...
<Route path="/book" element={<BookingPage />} />
```

- [ ] **Step 5: Verify**

`/book` shows the stepper with step 1 active and a "TODO: DateStep" placeholder.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(frontend): booking page shell + stepper"
```

### Task F4.2: Step 1 — Date selection

**Files:**
- Modify: `apps/frontend/src/features/booking/steps/DateStep.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/frontend/src/features/booking/steps/DateStep.tsx
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useBooking } from '../BookingProvider';

export function DateStep() {
  const { state, dispatch } = useBooking();
  const selected = state.date ? new Date(`${state.date}T00:00:00`) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section>
      <h2 className="text-2xl font-semibold">Pick a date</h2>
      <p className="mt-2 text-muted-foreground">Choose the day of your event.</p>
      <div className="mt-6 border rounded-lg p-4 inline-block">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && dispatch({ type: 'SET_DATE', date: format(d, 'yyyy-MM-dd') })}
          disabled={{ before: today }}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify + commit**

On `/book`, picking a date advances to step 2.

```bash
git add .
git commit -m "feat(frontend): date selection step"
```

### Task F4.3: Step 2 — Time slot selection

**Files:**
- Modify: `apps/frontend/src/features/booking/steps/TimeStep.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/frontend/src/features/booking/steps/TimeStep.tsx
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVenue, useTimeSlots, useUnavailableSlots } from '@/features/venue/api';
import { useBooking } from '../BookingProvider';

export function TimeStep() {
  const { state, dispatch } = useBooking();
  const { data: venue } = useVenue();
  const { data: slots, isLoading } = useTimeSlots(venue?.id);
  const { data: unavailable = [] } = useUnavailableSlots(venue?.id, state.date);

  if (isLoading || !slots) return <Skeleton className="h-40" />;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Pick a time</h2>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GO_TO', step: 1 })}>
          Change date
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground">
        {state.date && <>Available slots for <strong>{state.date}</strong></>}
      </p>
      <div className="mt-6 grid gap-3">
        {slots.map((slot) => {
          const taken = unavailable.includes(slot.id);
          const selected = state.timeSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={taken}
              onClick={() => dispatch({
                type: 'SET_TIME_SLOT', timeSlotId: slot.id, timeSlotLabel: slot.label,
              })}
              aria-pressed={selected}
              className={`text-left p-4 rounded-lg border transition
                ${selected ? 'border-accent ring-2 ring-accent' : 'border-border'}
                ${taken ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent'}`}
            >
              <div className="font-medium">{slot.label}</div>
              <div className="text-sm text-muted-foreground">
                {slot.start_time} – {slot.end_time}{taken && ' · Unavailable'}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify + commit**

Pick a date with no existing booking — all slots should be enabled. Pick a seed-data date (e.g. `current_date + 7` for `VH-SEED-001`) — the matching slot should be disabled. Selecting a slot advances to step 3.

```bash
git add .
git commit -m "feat(frontend): time slot step"
```

### Task F4.4: Step 3 — Details form

**Files:**
- Modify: `apps/frontend/src/features/booking/steps/DetailsStep.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/frontend/src/features/booking/steps/DetailsStep.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useVenue } from '@/features/venue/api';
import { useBooking } from '../BookingProvider';
import { detailsSchema, eventTypeLabels, type DetailsValues } from '../schema';

export function DetailsStep() {
  const { state, dispatch } = useBooking();
  const { data: venue } = useVenue();

  const {
    register, handleSubmit, setValue, formState: { errors, isSubmitting },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: state.details,
  });

  const onSubmit = handleSubmit((values) => {
    if (venue && values.guestCount > venue.capacity) {
      alert(`Guest count exceeds venue capacity of ${venue.capacity}`);
      return;
    }
    dispatch({ type: 'SET_DETAILS', details: values });
  });

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your details</h2>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GO_TO', step: 2 })}>
          Back
        </Button>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <Field label="Full name" error={errors.fullName?.message}>
          <Input {...register('fullName')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register('email')} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input type="tel" {...register('phone')} />
        </Field>
        <Field label="Event type" error={errors.eventType?.message}>
          <Select
            defaultValue={state.details?.eventType}
            onValueChange={(v) => setValue('eventType', v as DetailsValues['eventType'], { shouldValidate: true })}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {Object.entries(eventTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          label={`Estimated guest count${venue ? ` (max ${venue.capacity})` : ''}`}
          error={errors.guestCount?.message}
        >
          <Input
            type="number" min={1} max={venue?.capacity}
            {...register('guestCount', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Special requests (optional)" error={errors.specialRequests?.message}>
          <Textarea rows={4} {...register('specialRequests')} />
        </Field>
        <Button type="submit" disabled={isSubmitting}>Continue</Button>
      </form>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Try submitting with invalid data — inline errors appear. Valid submission advances to step 4.

```bash
git add .
git commit -m "feat(frontend): details form step"
```

### Task F4.5: Booking API client

**Files:**
- Create: `apps/frontend/src/features/booking/api.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/frontend/src/features/booking/api.ts
import { env } from '@/lib/env';
import type { DetailsValues } from './schema';

export interface SubmitBookingInput extends DetailsValues {
  venueId: string;
  date: string;
  timeSlotId: string;
}

export interface SubmittedBooking {
  id: string;
  reference_number: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export async function submitBooking(input: SubmitBookingInput): Promise<SubmittedBooking> {
  const res = await fetch(`${env.apiUrl}/api/bookings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message ?? 'Submission failed');
  }
  return body.booking as SubmittedBooking;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/booking/api.ts
git commit -m "feat(frontend): booking api client"
```

### Task F4.6: Step 4 — Review + submit

**Files:**
- Modify: `apps/frontend/src/features/booking/steps/ReviewStep.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/frontend/src/features/booking/steps/ReviewStep.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useBooking } from '../BookingProvider';
import { useVenue } from '@/features/venue/api';
import { eventTypeLabels } from '../schema';
import { submitBooking } from '../api';

export function ReviewStep() {
  const { state, dispatch } = useBooking();
  const { data: venue } = useVenue();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { date, timeSlotLabel, details, timeSlotId } = state;
  if (!date || !timeSlotLabel || !details || !venue || !timeSlotId) {
    return <div>Missing information — please go back.</div>;
  }

  const rows = [
    { label: 'Venue',      value: venue.name,                         step: null },
    { label: 'Date',       value: date,                               step: 1 as const },
    { label: 'Time',       value: timeSlotLabel,                      step: 2 as const },
    { label: 'Event type', value: eventTypeLabels[details.eventType], step: 3 as const },
    { label: 'Guests',     value: String(details.guestCount),         step: 3 as const },
    { label: 'Name',       value: details.fullName,                   step: 3 as const },
    { label: 'Email',      value: details.email,                      step: 3 as const },
    { label: 'Phone',      value: details.phone,                      step: 3 as const },
  ];

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const booking = await submitBooking({
        venueId: venue.id, date, timeSlotId, ...details,
      });
      dispatch({ type: 'CONFIRM', referenceNumber: booking.reference_number });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold">Review your booking</h2>
      <p className="mt-2 text-muted-foreground">Check everything and submit your request.</p>
      <dl className="mt-6 divide-y border rounded-lg overflow-hidden">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between p-4">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className="flex items-center gap-3">
              <span className="font-medium">{r.value}</span>
              {r.step && (
                <Button variant="ghost" size="sm"
                  onClick={() => dispatch({ type: 'GO_TO', step: r.step })}>
                  Edit
                </Button>
              )}
            </dd>
          </div>
        ))}
        {details.specialRequests && (
          <div className="p-4">
            <dt className="text-sm text-muted-foreground">Special requests</dt>
            <dd className="mt-1">{details.specialRequests}</dd>
          </div>
        )}
      </dl>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <Button className="mt-6" size="lg" onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Booking'}
      </Button>
    </section>
  );
}
```

- [ ] **Step 2: Verify (requires backend running)**

Start both apps (`npm run dev` in each). Complete the full booking flow. On submit, the backend returns a reference number and the state advances to step 5.

If you see a CORS error in the console, confirm `CORS_ORIGIN=http://localhost:5173` is set in `apps/backend/.env`.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(frontend): review + submit step"
```

### Task F4.7: Step 5 — Confirmation

**Files:**
- Modify: `apps/frontend/src/features/booking/steps/ConfirmationStep.tsx`

- [ ] **Step 1: Implement**

```tsx
// apps/frontend/src/features/booking/steps/ConfirmationStep.tsx
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '../BookingProvider';

export function ConfirmationStep() {
  const { state } = useBooking();
  return (
    <section className="text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 text-accent grid place-items-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold">Request submitted</h2>
      <p className="mt-2 text-muted-foreground">The venue admin will review your request shortly.</p>
      <div className="mt-8 inline-flex flex-col items-center gap-2 border rounded-lg p-6">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Reference</span>
        <span className="text-xl font-mono">{state.referenceNumber}</span>
        <Badge variant="secondary">Pending</Badge>
      </div>
      <div className="mt-10">
        <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify + commit**

Complete the flow; the confirmation page shows the reference + Pending badge.

```bash
git add .
git commit -m "feat(frontend): confirmation step"
```

---

## Phase F5: Admin authentication

### Task F5.1: Admin login page

**Files:**
- Create: `apps/frontend/src/features/admin/AdminLoginPage.tsx`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: Login page**

```tsx
// apps/frontend/src/features/admin/AdminLoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle className="text-center">Admin sign in</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Mount**

In `App.tsx`, replace the `/admin/login` placeholder:
```tsx
import { AdminLoginPage } from '@/features/admin/AdminLoginPage';
// ...
<Route path="/admin/login" element={<AdminLoginPage />} />
```

- [ ] **Step 3: Verify + commit**

Navigate to `/admin/login`, sign in as `admin@venuehub.com` / `admin123`. Should redirect to `/admin` (which is still a placeholder).

```bash
git add .
git commit -m "feat(frontend): admin login page"
```

### Task F5.2: `useAdminCheck` + `RequireAdmin`

**Files:**
- Create: `apps/frontend/src/shared/hooks/useAdminCheck.ts`
- Create: `apps/frontend/src/features/admin/RequireAdmin.tsx`

- [ ] **Step 1: useAdminCheck**

```typescript
// apps/frontend/src/shared/hooks/useAdminCheck.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from './useSession';

export function useAdminCheck() {
  const { session, loading: sessionLoading } = useSession();
  const query = useQuery({
    queryKey: ['admin-check', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_user')
        .select('user_id')
        .eq('user_id', session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
  return {
    isAdmin: query.data === true,
    loading: sessionLoading || query.isLoading,
    session,
  };
}
```

- [ ] **Step 2: RequireAdmin**

```tsx
// apps/frontend/src/features/admin/RequireAdmin.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminCheck } from '@/shared/hooks/useAdminCheck';

export function RequireAdmin() {
  const { isAdmin, loading, session } = useAdminCheck();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(frontend): admin route guard"
```

---

## Phase F6: Admin dashboard

### Task F6.1: Admin API

**Files:**
- Create: `apps/frontend/src/features/admin/api.ts`

- [ ] **Step 1: Implement**

```typescript
// apps/frontend/src/features/admin/api.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminBooking {
  id: string;
  reference_number: string;
  venue_id: string;
  date: string;
  time_slot_id: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  guest_count: number;
  special_requests: string | null;
  status: BookingStatus;
  admin_note: string | null;
  created_at: string;
}

export interface ListFilters {
  status?: BookingStatus | 'ALL';
  search?: string;
}

export async function listBookings(filters: ListFilters = {}): Promise<AdminBooking[]> {
  let q = supabase.from('booking').select('*').order('created_at', { ascending: false });
  if (filters.status && filters.status !== 'ALL') q = q.eq('status', filters.status);
  if (filters.search) {
    q = q.or(`full_name.ilike.%${filters.search}%,reference_number.ilike.%${filters.search}%`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data as AdminBooking[];
}

export async function fetchStats(): Promise<Record<BookingStatus | 'TOTAL', number>> {
  const { data, error } = await supabase.from('booking').select('status');
  if (error) throw error;
  const out: Record<string, number> = { TOTAL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const row of data ?? []) {
    out.TOTAL++;
    out[row.status]++;
  }
  return out as Record<BookingStatus | 'TOTAL', number>;
}

export async function updateBookingStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  adminNote: string | undefined,
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const res = await fetch(`${env.apiUrl}/api/admin/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ status, adminNote }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message ?? 'Update failed');
  return body.booking as AdminBooking;
}

export function useAdminBookings(filters: ListFilters) {
  return useQuery({ queryKey: ['admin-bookings', filters], queryFn: () => listBookings(filters) });
}

export function useAdminStats() {
  return useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/features/admin/api.ts
git commit -m "feat(frontend): admin api"
```

### Task F6.2: Admin layout + stats row

**Files:**
- Create: `apps/frontend/src/shared/components/AdminLayout.tsx`
- Create: `apps/frontend/src/features/admin/components/StatsRow.tsx`, `StatusBadge.tsx`, `FilterBar.tsx`, `BookingsTable.tsx`, `BookingDetailModal.tsx`
- Create: `apps/frontend/src/features/admin/AdminDashboardPage.tsx`

- [ ] **Step 1: AdminLayout**

```tsx
// apps/frontend/src/shared/components/AdminLayout.tsx
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-sm ${
    isActive ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted'
  }`;

export function AdminLayout() {
  const navigate = useNavigate();
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 flex flex-col gap-2">
        <Link to="/admin" className="font-semibold text-lg px-3 py-2">VenueHub Admin</Link>
        <nav className="flex-1 space-y-1 mt-4">
          <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
        </nav>
        <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
      </aside>
      <main className="p-8"><Outlet /></main>
    </div>
  );
}
```

- [ ] **Step 2: StatsRow**

```tsx
// apps/frontend/src/features/admin/components/StatsRow.tsx
import { Card, CardContent } from '@/components/ui/card';
import { useAdminStats } from '../api';

const items: { key: 'TOTAL' | 'PENDING' | 'APPROVED' | 'REJECTED'; label: string }[] = [
  { key: 'TOTAL',    label: 'Total' },
  { key: 'PENDING',  label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function StatsRow() {
  const { data, isLoading } = useAdminStats();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.key}>
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{it.label}</div>
            <div className="mt-2 text-3xl font-semibold">{isLoading ? '…' : data?.[it.key] ?? 0}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: StatusBadge**

```tsx
// apps/frontend/src/features/admin/components/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '../api';

const variants: Record<BookingStatus, 'default' | 'secondary' | 'destructive'> = {
  APPROVED: 'default', PENDING: 'secondary', REJECTED: 'destructive',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
```

- [ ] **Step 4: FilterBar**

```tsx
// apps/frontend/src/features/admin/components/FilterBar.tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BookingStatus } from '../api';

interface Props {
  status: BookingStatus | 'ALL';
  search: string;
  onChange: (next: { status: BookingStatus | 'ALL'; search: string }) => void;
}

export function FilterBar({ status, search, onChange }: Props) {
  return (
    <div className="flex gap-3">
      <Select value={status}
              onValueChange={(v) => onChange({ status: v as Props['status'], search })}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder="Search name or reference…" value={search}
             onChange={(e) => onChange({ status, search: e.target.value })} />
    </div>
  );
}
```

- [ ] **Step 5: BookingsTable**

```tsx
// apps/frontend/src/features/admin/components/BookingsTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import type { AdminBooking } from '../api';

interface Props {
  bookings: AdminBooking[];
  onRowClick: (b: AdminBooking) => void;
}

export function BookingsTable({ bookings, onRowClick }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Event date</TableHead>
          <TableHead>Event type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((b) => (
          <TableRow key={b.id} className="cursor-pointer" onClick={() => onRowClick(b)}>
            <TableCell className="font-mono text-xs">{b.reference_number}</TableCell>
            <TableCell>{b.full_name}</TableCell>
            <TableCell>{b.date}</TableCell>
            <TableCell>{b.event_type}</TableCell>
            <TableCell><StatusBadge status={b.status} /></TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(b.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
        {bookings.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
              No bookings
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 6: BookingDetailModal**

```tsx
// apps/frontend/src/features/admin/components/BookingDetailModal.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AdminBooking } from '../api';
import { StatusBadge } from './StatusBadge';

interface Props {
  booking: AdminBooking | null;
  onClose: () => void;
  onDecide?: (status: 'APPROVED' | 'REJECTED', note: string) => Promise<void>;
}

export function BookingDetailModal({ booking, onClose, onDecide }: Props) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<'APPROVED' | 'REJECTED' | null>(null);
  if (!booking) return null;

  const readOnly = booking.status !== 'PENDING' || !onDecide;

  const decide = async (status: 'APPROVED' | 'REJECTED') => {
    if (!onDecide) return;
    setPending(status);
    try { await onDecide(status, note); onClose(); }
    finally { setPending(null); }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{booking.reference_number}</span>
            <StatusBadge status={booking.status} />
          </DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Name">{booking.full_name}</Field>
          <Field label="Email">{booking.email}</Field>
          <Field label="Phone">{booking.phone}</Field>
          <Field label="Event type">{booking.event_type}</Field>
          <Field label="Date">{booking.date}</Field>
          <Field label="Guests">{booking.guest_count}</Field>
        </dl>
        {booking.special_requests && (
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Special requests</div>
            <p className="text-sm">{booking.special_requests}</p>
          </div>
        )}
        {!readOnly && (
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Admin note (optional)</div>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        )}
        <DialogFooter>
          {!readOnly ? (
            <>
              <Button variant="destructive" onClick={() => decide('REJECTED')} disabled={!!pending}>
                {pending === 'REJECTED' ? 'Rejecting…' : 'Reject'}
              </Button>
              <Button onClick={() => decide('APPROVED')} disabled={!!pending}>
                {pending === 'APPROVED' ? 'Approving…' : 'Approve'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
```

- [ ] **Step 7: AdminDashboardPage (composition)**

```tsx
// apps/frontend/src/features/admin/AdminDashboardPage.tsx
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StatsRow } from './components/StatsRow';
import { FilterBar } from './components/FilterBar';
import { BookingsTable } from './components/BookingsTable';
import { BookingDetailModal } from './components/BookingDetailModal';
import {
  useAdminBookings, updateBookingStatus, type AdminBooking, type BookingStatus,
} from './api';

export function AdminDashboardPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const { data: bookings = [], isLoading } = useAdminBookings({ status, search });

  const onDecide = async (next: 'APPROVED' | 'REJECTED', note: string) => {
    if (!selected) return;
    try {
      await updateBookingStatus(selected.id, next, note || undefined);
      toast.success(`Booking ${next.toLowerCase()}`);
      await qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      await qc.invalidateQueries({ queryKey: ['admin-stats'] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage incoming booking requests.</p>
      </div>
      <StatsRow />
      <FilterBar
        status={status} search={search}
        onChange={({ status, search }) => { setStatus(status); setSearch(search); }}
      />
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-muted-foreground">Loading…</div>
        ) : (
          <BookingsTable bookings={bookings} onRowClick={setSelected} />
        )}
      </div>
      <BookingDetailModal booking={selected} onClose={() => setSelected(null)} onDecide={onDecide} />
    </div>
  );
}
```

- [ ] **Step 8: Mount protected admin subtree in App.tsx**

```tsx
import { RequireAdmin } from '@/features/admin/RequireAdmin';
import { AdminLayout } from '@/shared/components/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';

// Inside <Routes>, replace the /admin placeholder:
<Route element={<RequireAdmin />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<AdminDashboardPage />} />
  </Route>
</Route>
```

- [ ] **Step 9: Verify (requires backend running)**

1. Sign in at `/admin/login`.
2. `/admin` shows the 4 stats cards and the table populated from seed data.
3. Click a PENDING row, type an admin note, click Approve.
4. Toast appears, modal closes, row badge updates to APPROVED, stats re-count.
5. Re-click the now-approved booking — buttons are gone (read-only).

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat(frontend): admin dashboard + approve/reject"
```

---

## Phase F7: Polish

### Task F7.1: Error boundary + 404

**Files:**
- Create: `apps/frontend/src/shared/components/ErrorBoundary.tsx`
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: ErrorBoundary**

```tsx
// apps/frontend/src/shared/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('[error-boundary]', error); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center p-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Wrap Routes + replace `*` placeholder**

```tsx
// apps/frontend/src/App.tsx — replace the * placeholder with:
const NotFound = () => (
  <div className="min-h-screen grid place-items-center p-8 text-center">
    <div>
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
    </div>
  </div>
);
```

Wrap the entire `<Routes>` tree in `<ErrorBoundary>`.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(frontend): error boundary + 404"
```

### Task F7.2: Code-split admin routes

Keeps the public bundle lean.

**Files:**
- Modify: `apps/frontend/src/App.tsx`

- [ ] **Step 1: Convert admin imports to lazy**

```tsx
import { lazy, Suspense } from 'react';

const AdminLoginPage = lazy(() =>
  import('@/features/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminLayout = lazy(() =>
  import('@/shared/components/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const RequireAdmin = lazy(() =>
  import('@/features/admin/RequireAdmin').then((m) => ({ default: m.RequireAdmin })),
);

// Wrap the admin subtree in <Suspense>:
<Route
  element={
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <RequireAdmin />
    </Suspense>
  }
>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<AdminDashboardPage />} />
  </Route>
</Route>

// Also wrap the login route in Suspense:
<Route
  path="/admin/login"
  element={
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <AdminLoginPage />
    </Suspense>
  }
/>
```

- [ ] **Step 2: Verify build chunks**

```bash
npm run build
```

Expected: the Vite build summary lists separate chunks for the admin pages (e.g. `AdminDashboardPage-XXXX.js`) rather than rolling them into the main bundle.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "perf(frontend): code-split admin routes"
```

### Task F7.3: Responsive + a11y pass

- [ ] **Step 1: Walk every route at 375px, 768px, 1280px**

Open DevTools device mode. Check: `/`, `/venue`, `/book` (all 5 steps), `/admin/login`, `/admin`. Fix any overflow, clipping, or stacking issues inline.

- [ ] **Step 2: Keyboard audit**

Tab through the details form and the booking detail modal. Every field must be reachable. Escape must close the modal. Focus must be trapped inside the modal (shadcn `Dialog` handles this by default).

- [ ] **Step 3: Icon-only buttons**

Audit any icon-only controls (sign-out, modal close) and add `aria-label` where missing.

- [ ] **Step 4: Commit fixes**

```bash
git add .
git commit -m "fix(frontend): responsive + a11y pass"
```

### Task F7.4: Build + test clean

- [ ] **Step 1: Typecheck + build**

```bash
npm run build
```

Expected: zero errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Fix any errors; warnings are acceptable if they're about intentional choices.

- [ ] **Step 3: Test**

```bash
npm test
```

Expected: all tests pass (reducer tests, at minimum).

- [ ] **Step 4: Commit**

If anything was fixed:
```bash
git add .
git commit -m "fix(frontend): build + lint cleanup"
```

---

## Done criteria for the frontend plan

- `/` renders landing page populated from Supabase (hero, highlights, gallery).
- `/venue` renders details page with amenities, pricing tiers, and availability sidebar.
- `/book` supports the full 5-step flow end-to-end (Date → Time → Details → Review → Confirmation) on mobile and desktop.
- Reducer tests (≥ 7) pass.
- `/admin/login` signs in a real Supabase admin user.
- `/admin` is protected — non-admin users get redirected.
- Admin dashboard shows stats, filterable table, and can approve/reject PENDING bookings.
- Already-decided bookings show as read-only in the modal.
- `npm run build` produces a lean public bundle with admin routes code-split.
- `npm test` and `npm run lint` pass.

## Not in this plan (owned elsewhere)

- Supabase project, schema, seed data, admin user creation — [integration plan Phase I1](2026-04-15-venuehub-integration.md#phase-i1-prerequisites-manual-setup).
- `POST /api/bookings` and `PATCH /api/admin/bookings/:id` implementation — [backend plan](2026-04-15-venuehub-backend.md).
- End-to-end smoke tests across both apps — [integration plan Phase I3](2026-04-15-venuehub-integration.md#phase-i3-end-to-end-verification-runs-after-backend--frontend-plans).
