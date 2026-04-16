import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PhotoGallery({ images }: { images: string[] }) {
  const [main, ...rest] = images.slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 pb-32">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-14 animate-fade-up">
        <h2 className="font-serif text-2xl md:text-3xl">The space</h2>
        <div className="flex-1 h-px bg-border" />
        <Link
          to="/venue"
          className="flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Editorial asymmetric grid */}
      <div className="grid md:grid-cols-[1.3fr_1fr] gap-4 md:gap-5">
        {/* Large feature image */}
        {main && (
          <div className="overflow-hidden group animate-fade-up delay-200">
            <img
              src={main}
              alt=""
              loading="lazy"
              className="w-full aspect-[4/5] md:aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        )}

        {/* Right column: stacked pair */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
          {rest.slice(0, 2).map((src, i) => (
            <div key={src} className={`overflow-hidden group animate-fade-up delay-${(i + 3) * 100}`}>
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: two wide images */}
      {rest.length > 2 && (
        <div className="grid grid-cols-2 gap-4 md:gap-5 mt-4 md:mt-5">
          {rest.slice(2, 4).map((src, i) => (
            <div key={src} className={`overflow-hidden group animate-fade-up delay-${(i + 5) * 100}`}>
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
