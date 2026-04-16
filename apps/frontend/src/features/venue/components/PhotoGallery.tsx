export function PhotoGallery({ images }: { images: string[] }) {
  return (
    <section className="max-w-6xl mx-auto px-6 mt-24">
      <h2 className="text-3xl font-semibold tracking-tight">The Space</h2>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.slice(0, 6).map((src) => (
          <img key={src} src={src} alt="" loading="lazy"
            className="aspect-[4/3] w-full object-cover rounded-lg" />
        ))}
      </div>
    </section>
  );
}
