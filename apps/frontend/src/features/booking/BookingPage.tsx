import { BookingProvider, useBooking } from './BookingProvider';
import { Stepper } from './components/Stepper';
import { DateStep } from './steps/DateStep';
import { TimeStep } from './steps/TimeStep';
import { DetailsStep } from './steps/DetailsStep';
import { ReviewStep } from './steps/ReviewStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

function StepBody() {
  const { state } = useBooking();
  switch (state.step) {
    case 1: return <DateStep />;
    case 2: return <TimeStep />;
    case 3: return <DetailsStep />;
    case 4: return <ReviewStep />;
    case 5: return <ConfirmationStep />;
  }
}

export function BookingPage() {
  return (
    <BookingProvider>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10"><Stepper /></div>
        <StepBody />
      </div>
    </BookingProvider>
  );
}
