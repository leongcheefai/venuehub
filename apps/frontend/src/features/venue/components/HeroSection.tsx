import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HeroSection({ name, imageUrl }: { name: string; imageUrl: string }) {
  return (
    <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-16 text-white">
        <p className="text-sm tracking-widest uppercase opacity-80">Venue</p>
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mt-2">{name}</h1>
        <p className="mt-3 max-w-xl text-lg opacity-90">Find your space, book your moment.</p>
        <Button asChild size="lg" className="mt-8 w-fit">
          <Link to="/book">Book Now</Link>
        </Button>
      </div>
    </section>
  );
}
