export function Footer() {
  return (
    <footer className="border-t mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-col sm:flex-row gap-4 justify-between">
        <div>&copy; {new Date().getFullYear()} VenueHub. All rights reserved.</div>
        <div>Find your space, book your moment.</div>
      </div>
    </footer>
  );
}
