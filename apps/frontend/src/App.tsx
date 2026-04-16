import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/shared/components/PublicLayout';
import { LandingPage } from '@/features/venue/LandingPage';
import { VenueDetailsPage } from '@/features/venue/VenueDetailsPage';
import { BookingPage } from '@/features/booking/BookingPage';
import { AdminLoginPage } from '@/features/admin/AdminLoginPage';
import { RequireAdmin } from '@/features/admin/RequireAdmin';
import { AdminLayout } from '@/shared/components/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/venue" element={<VenueDetailsPage />} />
        <Route path="/book" element={<BookingPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={
        <div className="min-h-screen grid place-items-center p-8 text-center">
          <div>
            <h1 className="text-4xl font-semibold">404</h1>
            <p className="mt-2 text-muted-foreground">Page not found</p>
          </div>
        </div>
      } />
    </Routes>
  );
}
