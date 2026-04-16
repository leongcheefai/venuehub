import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useVenue } from '@/features/venue/api';
import { useBooking } from '../BookingProvider';
import { detailsSchema, eventTypeLabels, type DetailsValues } from '../schema';

export function DetailsStep() {
  const { state, dispatch } = useBooking();
  const { data: venue } = useVenue();

  const {
    register, handleSubmit, setValue, formState: { errors, isSubmitting },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: state.details,
  });

  const onSubmit = handleSubmit((values) => {
    if (venue && values.guestCount > venue.capacity) {
      alert(`Guest count exceeds venue capacity of ${venue.capacity}`);
      return;
    }
    dispatch({ type: 'SET_DETAILS', details: values });
  });

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Your details</h2>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'GO_TO', step: 2 })}>
          Back
        </Button>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <Field label="Full name" error={errors.fullName?.message}>
          <Input {...register('fullName')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register('email')} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input type="tel" {...register('phone')} />
        </Field>
        <Field label="Event type" error={errors.eventType?.message}>
          <Select
            defaultValue={state.details?.eventType}
            onValueChange={(v) => setValue('eventType', v as DetailsValues['eventType'], { shouldValidate: true })}
          >
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {Object.entries(eventTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          label={`Estimated guest count${venue ? ` (max ${venue.capacity})` : ''}`}
          error={errors.guestCount?.message}
        >
          <Input
            type="number" min={1} max={venue?.capacity}
            {...register('guestCount', { valueAsNumber: true })}
          />
        </Field>
        <Field label="Special requests (optional)" error={errors.specialRequests?.message}>
          <Textarea rows={4} {...register('specialRequests')} />
        </Field>
        <Button type="submit" disabled={isSubmitting}>Continue</Button>
      </form>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
