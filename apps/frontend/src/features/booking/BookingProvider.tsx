import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { bookingReducer, initialBookingState, type BookingState, type BookingAction } from './reducer';

interface Ctx {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

const BookingCtx = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  return <BookingCtx.Provider value={{ state, dispatch }}>{children}</BookingCtx.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
