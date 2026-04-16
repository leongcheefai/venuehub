import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/shared/hooks/useSession';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-sm ${
    isActive ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted'
  }`;

export function AdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useSession();
  const handleSignOut = () => {
    signOut();
    navigate('/admin/login');
  };
  return (
    <div className="min-h-screen grid md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4 flex flex-col gap-2">
        <Link to="/admin" className="font-semibold text-lg px-3 py-2">VenueHub Admin</Link>
        <nav className="flex-1 space-y-1 mt-4">
          <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
        </nav>
        <Button variant="outline" size="sm" onClick={handleSignOut} aria-label="Sign out">Sign out</Button>
      </aside>
      <main className="p-8"><Outlet /></main>
    </div>
  );
}
