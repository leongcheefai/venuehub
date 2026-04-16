import { describe, it, expect } from 'vitest';
import { bookingReducer, initialBookingState } from './reducer';

describe('bookingReducer', () => {
  it('starts at step 1 with empty state', () => {
    expect(initialBookingState.step).toBe(1);
    expect(initialBookingState.date).toBeUndefined();
  });

  it('SET_DATE moves to step 2', () => {
    const s = bookingReducer(initialBookingState, { type: 'SET_DATE', date: '2099-01-01' });
    expect(s.date).toBe('2099-01-01');
    expect(s.step).toBe(2);
  });

  it('changing date clears the previously chosen time slot', () => {
    const s1 = bookingReducer(initialBookingState, { type: 'SET_DATE', date: '2099-01-01' });
    const s2 = bookingReducer(s1, { type: 'SET_TIME_SLOT', timeSlotId: 'a', timeSlotLabel: 'A' });
    const s3 = bookingReducer(s2, { type: 'SET_DATE', date: '2099-01-02' });
    expect(s3.timeSlotId).toBeUndefined();
    expect(s3.step).toBe(2);
  });

  it('SET_TIME_SLOT moves to step 3', () => {
    const s = bookingReducer(
      { ...initialBookingState, step: 2, date: '2099-01-01' },
      { type: 'SET_TIME_SLOT', timeSlotId: 'a', timeSlotLabel: 'Morning' },
    );
    expect(s.timeSlotId).toBe('a');
    expect(s.step).toBe(3);
  });

  it('SET_DETAILS moves to step 4', () => {
    const s = bookingReducer(initialBookingState, {
      type: 'SET_DETAILS',
      details: { fullName: 'A', email: 'a@b.co', phone: '555555', eventType: 'OTHER', guestCount: 5 },
    });
    expect(s.details?.fullName).toBe('A');
    expect(s.step).toBe(4);
  });

  it('GO_TO jumps to a specific step without clearing data', () => {
    const s = bookingReducer(
      { ...initialBookingState, step: 4, date: '2099-01-01' },
      { type: 'GO_TO', step: 1 },
    );
    expect(s.step).toBe(1);
    expect(s.date).toBe('2099-01-01');
  });

  it('CONFIRM sets reference and moves to step 5', () => {
    const s = bookingReducer(initialBookingState, {
      type: 'CONFIRM', referenceNumber: 'VH-20260415-001',
    });
    expect(s.referenceNumber).toBe('VH-20260415-001');
    expect(s.step).toBe(5);
  });
});
