import { nextBillingDate } from './billing-cycle';

describe('nextBillingDate', () => {
  it('keeps the same day on the following month', () => {
    expect(nextBillingDate(new Date(2026, 9, 15, 10, 30))).toEqual(new Date(2026, 10, 15, 10, 30));
  });

  it('falls back to the last day when the next month is shorter', () => {
    expect(nextBillingDate(new Date(2026, 9, 31))).toEqual(new Date(2026, 10, 30));
    expect(nextBillingDate(new Date(2027, 0, 31))).toEqual(new Date(2027, 1, 28));
    expect(nextBillingDate(new Date(2028, 0, 30))).toEqual(new Date(2028, 1, 29));
  });

  it('rolls over the year', () => {
    expect(nextBillingDate(new Date(2026, 11, 31))).toEqual(new Date(2027, 0, 31));
  });
});
