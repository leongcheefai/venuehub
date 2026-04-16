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
