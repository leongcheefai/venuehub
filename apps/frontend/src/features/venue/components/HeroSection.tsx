import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HeroSection({ name, imageUrl }: { name: string; imageUrl: string }) {
  return (
    <section className="relative noise-overlay">
      {/* ── Editorial split layout ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-0 min-h-[85vh] items-center">

          {/* Left: Typography */}
          <div className="py-20 md:py-0 md:pr-16 relative z-10">
            <div className="animate-fade-up">
              <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-warm-gold font-medium">
                Event Space
              </span>
              <div className="mt-1 h-px w-12 bg-warm-gold animate-reveal-line delay-300" />
            </div>

            <h1 className="mt-8 font-serif text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-tight animate-fade-up delay-200">
              {name}
            </h1>

            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-md animate-fade-up delay-400 font-light">
              An extraordinary setting for the moments that matter most.
            </p>

            <Link
              to="/book"
              className="mt-10 inline-flex items-center gap-3 group animate-fade-up delay-500"
            >
              <span className="text-[13px] uppercase tracking-[0.15em] font-medium text-foreground group-hover:text-accent transition-colors">
                Reserve your date
              </span>
              <span className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                <ArrowRight className="h-4 w-4 group-hover:text-accent-foreground transition-colors" />
              </span>
            </Link>
          </div>

          {/* Right: Hero image */}
          <div className="relative h-[50vh] md:h-[80vh] overflow-hidden animate-fade-in delay-300">
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover animate-gentle-zoom"
            />
            {/* Soft edge blends */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent md:opacity-60 opacity-0" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
