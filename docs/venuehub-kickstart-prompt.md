# VenueHub — Hall & Event Space Booking System

**Tagline**: Find your space, book your moment.

**Target User**: Two personas — (1) Event organizers, families, and community groups looking to browse and book halls or venue spaces for events like weddings, workshops, corporate meetups, or parties. (2) Venue administrators who manage incoming booking requests, availability, and venue listings through a protected dashboard.

---

## MVP Features

- **Venue Landing Page**: A polished, responsive public landing page showcasing the venue with hero imagery, key highlights (capacity, location, amenities), testimonials or social proof, and a clear CTA to "Book Now" or "View Details."
- **Venue Details Page**: A rich detail page with a photo gallery (lightbox or carousel), full amenities list with icons, capacity info, floor plan or layout options, location with embedded map, pricing tiers or packages (display only — no payment), and an availability calendar showing open/booked dates at a glance.
- **Booking Request Flow**: A multi-step form guiding the user through: (1) select a date from an interactive calendar, (2) pick an available time slot for that date, (3) fill in event details — full name, email, phone, event type (dropdown: wedding, corporate, birthday, workshop, community, other), estimated guest count, and optional special requests, (4) review a summary of all selections, and (5) submit the booking request.
- **Booking Confirmation Page**: After submission, show a confirmation screen with a unique booking reference number, a summary of the booking details, the current status ("Pending"), and a note that the admin will review and confirm.
- **Admin Authentication**: A simple login page for admins with email/password. No public registration — admin accounts are seeded. Protected routes that redirect to login if unauthenticated.
- **Admin Dashboard**: A clean dashboard showing booking statistics at a glance (total bookings, pending, approved, rejected counts). A table/list of all booking requests with columns for reference number, customer name, event date, event type, status, and submission date. Ability to filter by status (all, pending, approved, rejected) and search by name or reference. Click into a booking to see full details and approve or reject it with an optional admin note.

---

## UI/UX Guidelines

### Design Style
Clean, professional, and inviting. Think boutique hotel booking experience — not generic SaaS. Use warm neutral tones (soft whites, light grays, warm beige) with a single accent color (deep teal or muted gold) for CTAs and active states. Generous whitespace. High-quality imagery should be the hero — the UI frames the photos, not the other way around. Typography: a refined sans-serif for headings (e.g., Inter or DM Sans), system font stack for body.

### Navigation Pattern
- **Public site**: Top navbar with logo, nav links (Home, Details, Book Now), sticky on scroll. Mobile: hamburger menu.
- **Admin dashboard**: Sidebar layout on desktop with collapsible nav (Dashboard, Bookings, Settings). Mobile: bottom tab bar or collapsible sidebar.

### Key Screens

1. **Landing Page (/)**: 
   - Full-width hero section with venue photo, venue name, tagline, and "Book Now" CTA button
   - Highlights section: 3–4 cards showing capacity, amenities, location, pricing range
   - Photo grid or gallery preview (3–6 images)
   - Testimonials or event type showcase
   - Footer with contact info, address, social links

2. **Venue Details Page (/venue)**:
   - Photo gallery carousel with lightbox on click
   - Two-column layout on desktop: left = details (description, amenities with icons, capacity, pricing tiers), right = sticky sidebar with mini availability calendar and "Book This Venue" CTA
   - Embedded map section (static image or iframe)
   - Mobile: single column, CTA floats at bottom

3. **Booking Page (/book)**:
   - Stepper/progress indicator at top showing steps: Date → Time → Details → Review → Done
   - Step 1 — Date Selection: Interactive calendar component. Booked dates greyed out. Today highlighted. User clicks an available date to proceed.
   - Step 2 — Time Slot Selection: Grid of available time slots for the selected date (e.g., "9:00 AM – 12:00 PM", "1:00 PM – 5:00 PM", "6:00 PM – 10:00 PM"). Booked slots disabled. User clicks to select.
   - Step 3 — Event Details Form: Full name, email, phone (with validation), event type dropdown, estimated guest count (number input with min/max), special requests textarea. All fields validated inline.
   - Step 4 — Review Summary: Card showing all selections — date, time slot, event type, guest count, contact info. "Edit" links to jump back to any step. "Submit Booking" CTA.
   - Step 5 — Confirmation: Success state with checkmark animation, booking reference number (e.g., VH-20260415-001), summary, status badge ("Pending"), and "Back to Home" link.

4. **Admin Login (/admin/login)**:
   - Centered card with logo, email input, password input, and "Sign In" button
   - Error states for invalid credentials
   - Minimal design, no distractions

5. **Admin Dashboard (/admin)**:
   - Top stats row: 4 cards showing Total Bookings, Pending, Approved, Rejected with counts
   - Filter bar: status filter dropdown + search input + date range picker
   - Bookings table with columns: Reference, Customer, Event Date, Event Type, Status (color-coded badge), Submitted At, Actions
   - Pagination or infinite scroll for large lists
   - Click a row to expand or open a detail panel/modal

6. **Admin Booking Detail (modal or /admin/bookings/:id)**:
   - Full booking information: all customer details, event details, date/time, special requests
   - Status timeline or current status badge
   - Action buttons: "Approve" (green), "Reject" (red) — with optional admin note textarea before confirming
   - Status change triggers a UI update back in the table

### Interactions
- Smooth step transitions in the booking flow (slide or fade)
- Calendar date selection with hover states and visual feedback
- Time slot cards with selected state (accent border + checkmark)
- Form fields with inline validation — real-time error messages below each field, green checkmarks on valid
- Toast notifications for admin actions (e.g., "Booking approved successfully")
- Loading spinners/skeletons while data fetches
- Responsive breakpoints: mobile (< 768px), tablet (768–1024px), desktop (> 1024px)

---

## Tech Stack

### Frontend
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Component Library**: shadcn/ui (built on Radix UI) for accessible, polished primitives — buttons, inputs, selects, dialogs, badges, tables, toasts, calendar
- **Routing**: React Router v6 with protected route wrappers for admin
- **State Management**: React Context + useReducer for booking flow state; TanStack Query (React Query) for server state and API caching
- **Form Handling**: React Hook Form + Zod for schema-based validation
- **Date Handling**: date-fns for date formatting and manipulation
- **Icons**: Lucide React
- **Architecture**: Feature-based folder structure — `/features/booking`, `/features/admin`, `/features/venue`, `/shared/components`, `/shared/hooks`, `/shared/lib`

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Passport.js with JWT strategy for admin auth. Access token in httpOnly cookie or Authorization header. A guard decorator on admin routes.
- **Validation**: class-validator + class-transformer on DTOs
- **API Style**: RESTful — JSON responses, proper HTTP status codes, consistent error format
- **Architecture**: Module-based — `venue` module, `booking` module, `auth` module, `admin` module. Each with controller, service, DTOs, and Prisma model.

### Database Schema (Prisma models)

```
Venue
  - id (uuid, primary key)
  - name (string)
  - description (text)
  - address (string)
  - capacity (int)
  - amenities (string array)
  - images (string array — URLs or file paths)
  - pricingInfo (text or JSON — display only)
  - createdAt, updatedAt

TimeSlot
  - id (uuid)
  - venueId (foreign key)
  - label (string, e.g. "Morning: 9 AM – 12 PM")
  - startTime (string, e.g. "09:00")
  - endTime (string, e.g. "12:00")

Booking
  - id (uuid, primary key)
  - referenceNumber (string, unique, e.g. "VH-20260415-001")
  - venueId (foreign key)
  - date (date)
  - timeSlotId (foreign key)
  - fullName (string)
  - email (string)
  - phone (string)
  - eventType (enum: WEDDING, CORPORATE, BIRTHDAY, WORKSHOP, COMMUNITY, OTHER)
  - guestCount (int)
  - specialRequests (text, optional)
  - status (enum: PENDING, APPROVED, REJECTED)
  - adminNote (text, optional)
  - createdAt, updatedAt

Admin
  - id (uuid, primary key)
  - email (string, unique)
  - passwordHash (string)
  - name (string)
  - createdAt
```

### API Endpoints

```
Public:
  GET    /api/venues/:id             — Get venue details
  GET    /api/venues/:id/availability?date=YYYY-MM-DD  — Get available time slots for a date
  POST   /api/bookings               — Submit a new booking request
  GET    /api/bookings/:ref          — Get booking status by reference number

Auth:
  POST   /api/auth/login             — Admin login, returns JWT
  POST   /api/auth/logout            — Clear session/token

Admin (protected):
  GET    /api/admin/bookings         — List all bookings (filterable by status, searchable, paginated)
  GET    /api/admin/bookings/:id     — Get full booking detail
  PATCH  /api/admin/bookings/:id     — Update booking status (approve/reject) with optional admin note
  GET    /api/admin/stats            — Dashboard stats (counts by status)
```

---

## Constraints

- **No payment integration**: Pricing information is display-only. No Stripe, no checkout. The booking flow ends at "request submitted."
- **Single venue focus for MVP**: The system manages one venue. The data model supports multiple venues for future expansion, but the UI assumes a single venue context. No venue listing/search page needed.
- **Seed data required**: Provide a seed script that creates: 1 venue with realistic details and placeholder images, 3–4 time slots, 1 admin account (email: admin@venuehub.com, password: admin123), and 5–10 sample bookings in various statuses for the admin dashboard to feel populated.
- **No real-time updates**: Admin dashboard uses polling or manual refresh — no WebSocket requirement for MVP.
- **Responsive first**: Every screen must work well on mobile (375px width) through desktop (1440px). Test the booking flow especially on mobile — it's where most users will be.
- **Accessibility basics**: Proper semantic HTML, keyboard navigation on forms and modals, ARIA labels on icon-only buttons, focus management in the multi-step form, color contrast compliance.
- **No file uploads**: Venue images are seeded as URLs (use Unsplash or placeholder URLs). Users don't upload anything in the booking flow.
- **Form validation is critical**: Every input field must validate — required fields, email format, phone format, guest count within venue capacity, date must be in the future, time slot must be available. Show clear, helpful error messages.
- **Environment config**: Use environment variables for database URL, JWT secret, and API base URL. Provide a `.env.example` file.
- **No external auth providers**: Simple email/password for admin. No OAuth, no social login.
- **Performance**: Lazy load images in gallery. Code-split admin routes from public routes. Keep initial bundle lean.
