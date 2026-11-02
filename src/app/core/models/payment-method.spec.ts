import { resolvePaymentMethodType, toPaymentMethodChoices } from './payment-method';

describe('payment method mapping', () => {
  it('resolves method types from names ignoring case and accents', () => {
    expect(resolvePaymentMethodType('Cartão de Crédito')).toBe('CREDIT_CARD');
    expect(resolvePaymentMethodType('CARTAO DE DEBITO')).toBe('DEBIT_CARD');
    expect(resolvePaymentMethodType('pix')).toBe('PIX');
    expect(resolvePaymentMethodType('Boleto')).toBeNull();
  });

  it('keeps supported methods in a fixed order with the original name', () => {
    const choices = toPaymentMethodChoices([
      { name: 'Pix' },
      { name: 'Boleto' },
      { name: 'Cartão de Débito' },
      { name: 'Cartão de Crédito' },
    ]);

    expect(choices).toEqual([
      { type: 'CREDIT_CARD', name: 'Cartão de Crédito', shortLabel: 'Crédito' },
      { type: 'DEBIT_CARD', name: 'Cartão de Débito', shortLabel: 'Débito' },
      { type: 'PIX', name: 'Pix', shortLabel: 'Pix' },
    ]);
  });
});
