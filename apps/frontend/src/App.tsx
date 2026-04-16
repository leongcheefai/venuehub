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
