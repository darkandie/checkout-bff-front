export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'unknown';

const BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  elo: 'Elo',
  unknown: 'Cartão',
};

const ELO_PREFIXES = ['4011', '4312', '4389', '4514', '4576', '5041', '5066', '5067', '509', '6277', '6362', '6363', '650', '6516', '6550'];

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(value: string): CardBrand {
  const digits = digitsOnly(value);
  if (ELO_PREFIXES.some((prefix) => digits.startsWith(prefix))) {
    return 'elo';
  }
  if (/^3[47]/.test(digits)) {
    return 'amex';
  }
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return 'mastercard';
  }
  if (digits.startsWith('4')) {
    return 'visa';
  }
  return 'unknown';
}

export function cardBrandLabel(brand: CardBrand): string {
  return BRAND_LABELS[brand];
}

export function passesLuhn(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length === 0) {
    return false;
  }
  let sum = 0;
  for (let index = 0; index < digits.length; index++) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  const groups = detectCardBrand(digits) === 'amex' ? [4, 6, 5] : [4, 4, 4, 4, 3];
  const parts: string[] = [];
  let position = 0;
  for (const size of groups) {
    if (position >= digits.length) {
      break;
    }
    parts.push(digits.slice(position, position + size));
    position += size;
  }
  return parts.join(' ');
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function lastDigits(value: string, count = 4): string {
  const digits = digitsOnly(value);
  return digits.length >= count ? digits.slice(-count) : '';
}
