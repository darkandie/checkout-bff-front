import { PaymentMethodOption, PaymentMethodType } from './checkout.models';

export interface PaymentMethodChoice {
  type: PaymentMethodType;
  name: string;
  shortLabel: string;
}

const SHORT_LABELS: Record<PaymentMethodType, string> = {
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  PIX: 'Pix',
};

const DISPLAY_ORDER: PaymentMethodType[] = ['CREDIT_CARD', 'DEBIT_CARD', 'PIX'];

export function toPaymentMethodChoices(options: PaymentMethodOption[]): PaymentMethodChoice[] {
  return options
    .map((option) => {
      const type = resolvePaymentMethodType(option.name);
      return type ? { type, name: option.name, shortLabel: SHORT_LABELS[type] } : null;
    })
    .filter((choice): choice is PaymentMethodChoice => choice !== null)
    .sort((a, b) => DISPLAY_ORDER.indexOf(a.type) - DISPLAY_ORDER.indexOf(b.type));
}

export function resolvePaymentMethodType(name: string): PaymentMethodType | null {
  const normalized = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  if (normalized.includes('pix')) {
    return 'PIX';
  }
  if (normalized.includes('debito')) {
    return 'DEBIT_CARD';
  }
  if (normalized.includes('credito')) {
    return 'CREDIT_CARD';
  }
  return null;
}

export function requiresCard(type: PaymentMethodType): boolean {
  return type !== 'PIX';
}
