import {
  cardBrandLabel,
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  lastDigits,
  passesLuhn,
} from './card-number';

describe('card number helpers', () => {
  it('keeps only digits', () => {
    expect(digitsOnly('4242 4242-4242 4242')).toBe('4242424242424242');
  });

  it.each([
    ['4242424242424242', 'visa'],
    ['5555555555554444', 'mastercard'],
    ['2223003122003222', 'mastercard'],
    ['378282246310005', 'amex'],
    ['6362970000457013', 'elo'],
    ['9999999999999999', 'unknown'],
  ])('detects the brand of %s as %s', (number, brand) => {
    expect(detectCardBrand(number)).toBe(brand);
  });

  it('labels brands for display', () => {
    expect(cardBrandLabel('visa')).toBe('Visa');
    expect(cardBrandLabel('unknown')).toBe('Cartão');
  });

  it('validates numbers with the Luhn algorithm', () => {
    expect(passesLuhn('4242 4242 4242 4242')).toBe(true);
    expect(passesLuhn('4000000000000002')).toBe(true);
    expect(passesLuhn('4242424242424241')).toBe(false);
    expect(passesLuhn('')).toBe(false);
  });

  it('groups digits while typing', () => {
    expect(formatCardNumber('424242')).toBe('4242 42');
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    expect(formatCardNumber('4242a4242')).toBe('4242 4242');
  });

  it('formats the expiry as MM/YY', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('12')).toBe('12');
    expect(formatExpiry('1230')).toBe('12/30');
    expect(formatExpiry('12/309')).toBe('12/30');
  });

  it('returns the last four digits', () => {
    expect(lastDigits('4242 4242 4242 1234')).toBe('1234');
    expect(lastDigits('12')).toBe('');
  });
});
