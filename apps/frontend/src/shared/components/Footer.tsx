import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-deep text-background/70 noise-overlay relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-0 justify-between">
          {/* Brand */}
          <div>
            <div className="font-serif text-2xl text-background/90 tracking-tight">
              Venue<span className="text-warm-gold">Hub</span>
            </div>
            <p className="mt-3 text-sm max-w-xs leading-relaxed font-light">
              An extraordinary setting for the moments that matter most.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex gap-10 text-[13px] uppercase tracking-[0.12em]">
            <div className="flex flex-col gap-3">
              <span className="text-warm-gold text-[11px] tracking-[0.2em] mb-1">Navigate</span>
              <Link to="/" className="hover:text-background transition-colors">Home</Link>
              <Link to="/venue" className="hover:text-background transition-colors">Details</Link>
              <Link to="/book" className="hover:text-background transition-colors">Reserve</Link>
            </div>
          </nav>
        </div>

        <div className="h-px bg-background/10 mt-14 mb-8" />
        <div className="text-[12px] tracking-wide text-background/40 font-light">
          &copy; {new Date().getFullYear()} VenueHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
