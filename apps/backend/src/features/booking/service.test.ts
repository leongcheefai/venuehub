import { describe, it, expect } from 'vitest';
import { generateReferenceNumber } from './service';

describe('generateReferenceNumber', () => {
  it('formats as VH-YYYYMMDD-NNN', () => {
    expect(generateReferenceNumber(new Date('2026-04-15T10:00:00Z'), 1))
      .toBe('VH-20260415-001');
  });

  it('zero-pads sequence to 3 digits', () => {
    expect(generateReferenceNumber(new Date('2026-01-01T00:00:00Z'), 42))
      .toBe('VH-20260101-042');
  });

  it('does not truncate sequences over 999', () => {
    expect(generateReferenceNumber(new Date('2026-01-01T00:00:00Z'), 1234))
      .toBe('VH-20260101-1234');
  });
});
