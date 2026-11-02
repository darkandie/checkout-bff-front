import {
  CheckoutResponse,
  FrontendErrorResponse,
  PreCheckoutResponse,
} from '../app/core/models/checkout.models';

export const FIXED_NOW = new Date('2026-10-31T12:00:00Z');
export const fixedClock = () => new Date(FIXED_NOW);

export const CART: PreCheckoutResponse = {
  cartId: '8f6c1d1e-0c56-4f7e-9d0a-5b8f1f6f1c2a',
  products: [
    {
      slug: 'premium',
      name: 'Plano Premium',
      description: 'Assinatura mensal com catálogo completo',
      price: 39.9,
      currency: 'BRL',
    },
  ],
  paymentMethods: [{ name: 'Cartão de Crédito' }, { name: 'Cartão de Débito' }, { name: 'Pix' }],
};

export const APPROVED_CARD = {
  holderName: 'Marina Almeida',
  number: '4242424242424242',
  expiry: '12/30',
  cvv: '123',
};

export const DECLINED_CARD = { ...APPROVED_CARD, number: '4000000000000002' };

export const CARD_RESULT: CheckoutResponse = {
  cartId: CART.cartId,
  status: 'APROVADO',
  paidAt: '2026-10-31T12:00:00Z',
  payment: { method: 'Cartão de Crédito', lastDigits: '4242', amount: 39.9, currency: 'BRL' },
  products: [{ slug: 'premium', name: 'Plano Premium', price: 39.9 }],
};

export function errorResponse(
  errorCode: string,
  displayType: 'BLOCK' | 'INTERVENTION' = 'BLOCK',
): FrontendErrorResponse {
  return {
    displayType,
    errorCode,
    cartId: CART.cartId,
    frontendError: {
      code: 'P-1001',
      title: 'Pagamento não aprovado',
      description: 'Não foi possível concluir o pagamento. Tente novamente ou escolha outro meio.',
      primaryButton: { label: 'Tentar novamente', url: 'RETRY' },
      secondaryButton: { label: 'Trocar meio de pagamento', url: '/checkout/pagamento' },
    },
  };
}

export function textOf(element: Element | null | undefined): string {
  return (element?.textContent ?? '').replace(/\s+/g, ' ').trim();
}
