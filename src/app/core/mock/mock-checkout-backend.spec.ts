import { APPROVED_CARD, DECLINED_CARD, FIXED_NOW } from '../../../testing/fixtures';
import { crc16 } from '../../shared/payment/pix-code';
import { MockBackendError } from './mock-errors';
import { MockCheckoutBackend } from './mock-checkout-backend';

describe('MockCheckoutBackend', () => {
  let now: Date;
  let backend: MockCheckoutBackend;

  beforeEach(() => {
    now = new Date(FIXED_NOW);
    backend = new MockCheckoutBackend(() => now);
  });

  const failure = (call: () => unknown): MockBackendError => {
    try {
      call();
    } catch (error) {
      return error as MockBackendError;
    }
    throw new Error('expected the call to fail');
  };

  const newCart = () => backend.preCheckout({ products: [{ slug: 'premium' }] });

  it('creates a cart with the plan and the three payment methods', () => {
    const cart = newCart();

    expect(cart.products.map((product) => product.slug)).toEqual(['premium']);
    expect(cart.paymentMethods.map((method) => method.name)).toEqual([
      'Cartão de Crédito',
      'Cartão de Débito',
      'Pix',
    ]);
  });

  it('rejects unknown products like the BFF', () => {
    const error = failure(() => backend.preCheckout({ products: [{ slug: 'ultra' }] }));

    expect(error.status).toBe(422);
    expect(error.body.errorCode).toBe('PRODUCT_NOT_FOUND');
    expect(error.body.cartId).toBeNull();
  });

  it('approves a card payment returning only the last digits', () => {
    const cart = newCart();

    const result = backend.checkout({
      cartId: cart.cartId,
      paymentMethod: { name: 'Cartão de Crédito', card: APPROVED_CARD },
    });

    expect(result.status).toBe('APROVADO');
    expect(result.payment).toEqual({
      method: 'Cartão de Crédito',
      lastDigits: '4242',
      amount: 39.9,
      currency: 'BRL',
    });
    expect(result.paidAt).toBe('2026-10-31T12:00:00Z');
  });

  it('approves Pix returning a valid BR Code', () => {
    const cart = newCart();

    const result = backend.checkout({ cartId: cart.cartId, paymentMethod: { name: 'Pix' } });
    const code = result.payment.pixCode ?? '';

    expect(result.payment.lastDigits).toBeUndefined();
    expect(code.slice(-4)).toBe(crc16(code.slice(0, -4)));
  });

  it('declines cards ending in 0002 and allows a new attempt', () => {
    const cart = newCart();

    const declined = failure(() =>
      backend.checkout({
        cartId: cart.cartId,
        paymentMethod: { name: 'Cartão de Débito', card: DECLINED_CARD },
      }),
    );
    const approved = backend.checkout({
      cartId: cart.cartId,
      paymentMethod: { name: 'Cartão de Débito', card: APPROVED_CARD },
    });

    expect(declined.status).toBe(422);
    expect(declined.body.errorCode).toBe('PAYMENT_DECLINED');
    expect(declined.body.displayType).toBe('BLOCK');
    expect(approved.status).toBe('APROVADO');
  });

  it('blocks a second payment of the same cart', () => {
    const cart = newCart();
    backend.checkout({ cartId: cart.cartId, paymentMethod: { name: 'Pix' } });

    const error = failure(() =>
      backend.checkout({ cartId: cart.cartId, paymentMethod: { name: 'Pix' } }),
    );

    expect(error.status).toBe(409);
    expect(error.body.errorCode).toBe('PAYMENT_ALREADY_APPROVED');
  });

  it('enforces card data rules, offered methods, unknown and expired carts', () => {
    const cart = newCart();

    expect(
      failure(() =>
        backend.checkout({
          cartId: cart.cartId,
          paymentMethod: { name: 'Pix', card: APPROVED_CARD },
        }),
      ).body.errorCode,
    ).toBe('INVALID_PAYMENT_DATA');
    expect(
      failure(() =>
        backend.checkout({ cartId: cart.cartId, paymentMethod: { name: 'Cartão de Crédito' } }),
      ).body.errorCode,
    ).toBe('INVALID_PAYMENT_DATA');
    expect(
      failure(() => backend.checkout({ cartId: cart.cartId, paymentMethod: { name: 'Boleto' } }))
        .body.errorCode,
    ).toBe('PAYMENT_METHOD_NOT_ALLOWED');
    expect(
      failure(() => backend.checkout({ cartId: 'missing', paymentMethod: { name: 'Pix' } })).body
        .errorCode,
    ).toBe('CART_NOT_FOUND');

    now = new Date(FIXED_NOW.getTime() + 30 * 60 * 1000);
    const expired = failure(() =>
      backend.checkout({ cartId: cart.cartId, paymentMethod: { name: 'Pix' } }),
    );
    expect(expired.status).toBe(410);
    expect(expired.body.errorCode).toBe('CART_EXPIRED');
  });
});
