import type { DetailsValues } from './schema';

export interface BookingState {
  step: 1 | 2 | 3 | 4 | 5;
  date?: string;
  timeSlotId?: string;
  timeSlotLabel?: string;
  details?: DetailsValues;
  referenceNumber?: string;
}

export const initialBookingState: BookingState = { step: 1 };

export type BookingAction =
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_TIME_SLOT'; timeSlotId: string; timeSlotLabel: string }
  | { type: 'SET_DETAILS'; details: DetailsValues }
  | { type: 'GO_TO'; step: BookingState['step'] }
  | { type: 'CONFIRM'; referenceNumber: string }
  | { type: 'RESET' };

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_DATE':
      return state.date === action.date
        ? { ...state, step: 2 }
        : { ...state, date: action.date, timeSlotId: undefined, timeSlotLabel: undefined, step: 2 };
    case 'SET_TIME_SLOT':
      return { ...state, timeSlotId: action.timeSlotId, timeSlotLabel: action.timeSlotLabel, step: 3 };
    case 'SET_DETAILS':
      return { ...state, details: action.details, step: 4 };
    case 'GO_TO':
      return { ...state, step: action.step };
    case 'CONFIRM':
      return { ...state, referenceNumber: action.referenceNumber, step: 5 };
    case 'RESET':
      return initialBookingState;
  }
}
