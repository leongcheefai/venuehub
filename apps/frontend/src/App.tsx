import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/shared/components/PublicLayout';
import { LandingPage } from '@/features/venue/LandingPage';
import { VenueDetailsPage } from '@/features/venue/VenueDetailsPage';
import { BookingPage } from '@/features/booking/BookingPage';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8"><h1 className="text-2xl">{title}</h1></div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/venue" element={<VenueDetailsPage />} />
        <Route path="/book" element={<BookingPage />} />
      </Route>
      <Route path="/admin/login" element={<Placeholder title="Admin Login" />} />
      <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
      <Route path="*" element={<Placeholder title="Not Found" />} />
    </Routes>
  );
}
