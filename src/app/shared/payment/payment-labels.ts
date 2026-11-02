import { PaymentAttemptSummary } from '../../core/state/checkout.store';
import { cardBrandLabel } from './card-number';

export function paymentLabel(attempt: PaymentAttemptSummary | null): string {
  if (!attempt) {
    return '';
  }
  if (attempt.type === 'PIX' || !attempt.brand) {
    return attempt.shortLabel;
  }
  return `${attempt.shortLabel} · ${cardBrandLabel(attempt.brand)} •••• ${attempt.lastDigits}`;
}

export function orderCode(cartId: string): string {
  return `#${cartId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

export function firstName(fullName: string | null): string | null {
  const name = fullName?.trim().split(/\s+/)[0];
  if (!name) {
    return null;
  }
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
