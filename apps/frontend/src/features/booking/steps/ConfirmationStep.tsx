import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '../BookingProvider';

export function ConfirmationStep() {
  const { state } = useBooking();
  return (
    <section className="text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 text-accent grid place-items-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold">Request submitted</h2>
      <p className="mt-2 text-muted-foreground">The venue admin will review your request shortly.</p>
      <div className="mt-8 inline-flex flex-col items-center gap-2 border rounded-lg p-6">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Reference</span>
        <span className="text-xl font-mono">{state.referenceNumber}</span>
        <Badge variant="secondary">Pending</Badge>
      </div>
      <div className="mt-10">
        <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
      </div>
    </section>
  );
}
