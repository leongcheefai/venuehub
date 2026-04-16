import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

export function AvailabilitySidebar() {
  return (
    <aside className="md:sticky md:top-24">
      <Card>
        <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Calendar mode="single" className="rounded-md border" />
          <Button asChild className="w-full" size="lg">
            <Link to="/book">Book This Venue</Link>
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
