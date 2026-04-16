import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/shared/components/PublicLayout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { LandingPage } from '@/features/venue/LandingPage';
import { VenueDetailsPage } from '@/features/venue/VenueDetailsPage';
import { BookingPage } from '@/features/booking/BookingPage';

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

const Loading = () => <div className="p-8">Loading…</div>;

const NotFound = () => (
  <div className="min-h-screen grid place-items-center p-8 text-center">
    <div>
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/venue" element={<VenueDetailsPage />} />
          <Route path="/book" element={<BookingPage />} />
        </Route>
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<Loading />}>
              <AdminLoginPage />
            </Suspense>
          }
        />
        <Route
          element={
            <Suspense fallback={<Loading />}>
              <RequireAdmin />
            </Suspense>
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
