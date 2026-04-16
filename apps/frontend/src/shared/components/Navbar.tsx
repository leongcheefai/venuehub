import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-[13px] uppercase tracking-[0.12em] font-medium transition-colors ${
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  }`;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-tight">
          Venue<span className="text-warm-gold">Hub</span>
        </Link>
        <nav className="flex items-center gap-8">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/venue" className={navClass}>Details</NavLink>
          <Button asChild className="bg-deep text-background hover:bg-foreground rounded-none px-5 h-9 text-[13px] uppercase tracking-[0.08em] font-medium">
            <Link to="/book" className="flex items-center gap-2">
              Reserve <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </nav>
      </div>
      <div className="h-px bg-border" />
    </header>
  );
}
