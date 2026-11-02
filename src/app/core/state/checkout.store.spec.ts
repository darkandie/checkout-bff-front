import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { APPROVED_CARD, CART, CARD_RESULT, errorResponse } from '../../../testing/fixtures';
import { CheckoutApi } from '../api/checkout-api';
import { CheckoutError } from '../api/checkout-error';
import { CHECKOUT_CONFIG } from '../config/checkout-config';
import { CheckoutRequest, CheckoutResponse, PreCheckoutResponse } from '../models/checkout.models';
import { CheckoutStore } from './checkout.store';

describe('CheckoutStore', () => {
  let store: CheckoutStore;
  let api: {
    preCheckout: ReturnType<typeof vi.fn<(slugs: string[]) => Observable<PreCheckoutResponse>>>;
    checkout: ReturnType<typeof vi.fn<(request: CheckoutRequest) => Observable<CheckoutResponse>>>;
  };

  beforeEach(() => {
    api = {
      preCheckout: vi.fn(() => of(CART)),
      checkout: vi.fn(() => of(CARD_RESULT)),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: CheckoutApi, useValue: api },
        {
          provide: CHECKOUT_CONFIG,
          useValue: { apiBaseUrl: '', useMockBackend: false, defaultPlan: 'premium' },
        },
      ],
    });
    store = TestBed.inject(CheckoutStore);
  });

  const failWith = (displayType: 'BLOCK' | 'INTERVENTION', errorCode: string) =>
    api.checkout.mockReturnValueOnce(
      throwError(() => new CheckoutError(errorResponse(errorCode, displayType))),
    );

  it('loads the default plan and selects the first payment method', async () => {
    await store.loadCart();

    expect(api.preCheckout).toHaveBeenCalledWith(['premium']);
    expect(store.status()).toBe('ready');
    expect(store.total()).toBe(39.9);
    expect(store.paymentMethods().map((method) => method.type)).toEqual([
      'CREDIT_CARD',
      'DEBIT_CARD',
      'PIX',
    ]);
    expect(store.selectedMethod()?.type).toBe('CREDIT_CARD');
  });

  it('reuses the loaded cart and shares an in-flight request for the same plan', async () => {
    const response = new Subject<PreCheckoutResponse>();
    api.preCheckout.mockReturnValueOnce(response);

    const first = store.loadCart('familia');
    const second = store.loadCart('familia');
    response.next(CART);
    response.complete();
    await Promise.all([first, second]);
    await store.loadCart();

    expect(api.preCheckout).toHaveBeenCalledTimes(1);
    expect(store.plan()).toBe('familia');
  });

  it('loads a new cart when another plan is requested', async () => {
    await store.loadCart('premium');
    await store.loadCart('familia');

    expect(api.preCheckout).toHaveBeenLastCalledWith(['familia']);
  });

  it('exposes the API error when the cart cannot be loaded', async () => {
    api.preCheckout.mockReturnValueOnce(
      throwError(() => new CheckoutError(errorResponse('PRODUCT_NOT_FOUND'))),
    );

    await store.loadCart('ultra');

    expect(store.status()).toBe('unavailable');
    expect(store.loadError()?.errorCode).toBe('PRODUCT_NOT_FOUND');
  });

  it('pays with card sending the method name and card data', async () => {
    await store.loadCart();

    const outcome = await store.pay(APPROVED_CARD);

    expect(api.checkout).toHaveBeenCalledWith({
      cartId: CART.cartId,
      paymentMethod: { name: 'Cartão de Crédito', card: APPROVED_CARD },
    });
    expect(outcome).toBe('success');
    expect(store.result()).toEqual(CARD_RESULT);
    expect(store.attempt()).toEqual({
      type: 'CREDIT_CARD',
      methodName: 'Cartão de Crédito',
      shortLabel: 'Crédito',
      brand: 'visa',
      lastDigits: '4242',
      holderName: 'Marina Almeida',
    });
  });

  it('pays with Pix without card data', async () => {
    await store.loadCart();
    store.selectMethod('PIX');

    await store.pay(APPROVED_CARD);

    expect(api.checkout).toHaveBeenCalledWith({
      cartId: CART.cartId,
      paymentMethod: { name: 'Pix' },
    });
    expect(store.attempt()?.lastDigits).toBeNull();
  });

  it('reports blocking errors as failures that can be retried', async () => {
    await store.loadCart();
    failWith('BLOCK', 'PAYMENT_DECLINED');

    const outcome = await store.pay(APPROVED_CARD);

    expect(outcome).toBe('failure');
    expect(store.failure()?.errorCode).toBe('PAYMENT_DECLINED');
    expect(store.canRetry()).toBe(true);

    const retried = await store.retry();

    expect(retried).toBe('success');
    expect(api.checkout).toHaveBeenCalledTimes(2);
    expect(api.checkout.mock.calls[1][0]).toEqual(api.checkout.mock.calls[0][0]);
    expect(store.failure()).toBeNull();
    expect(store.canRetry()).toBe(false);
  });

  it('keeps interventions on the payment screen and clears them on method change', async () => {
    await store.loadCart();
    failWith('INTERVENTION', 'INVALID_PAYMENT_DATA');

    const outcome = await store.pay(APPROVED_CARD);

    expect(outcome).toBe('intervention');
    expect(store.intervention()?.errorCode).toBe('INVALID_PAYMENT_DATA');
    expect(store.failure()).toBeNull();

    store.selectMethod('PIX');

    expect(store.intervention()).toBeNull();
  });

  it('is processing while the payment is in flight', async () => {
    await store.loadCart();
    const response = new Subject<CheckoutResponse>();
    api.checkout.mockReturnValueOnce(response);

    const payment = store.pay(APPROVED_CARD);

    expect(store.isProcessing()).toBe(true);
    response.next(CARD_RESULT);
    response.complete();
    await payment;
    expect(store.isProcessing()).toBe(false);
  });

  it('starts a new purchase with a fresh cart after a payment', async () => {
    await store.loadCart('familia');
    await store.pay(APPROVED_CARD);

    await store.restart();

    expect(api.preCheckout).toHaveBeenCalledTimes(2);
    expect(api.preCheckout).toHaveBeenLastCalledWith(['familia']);
    expect(store.result()).toBeNull();
    expect(store.attempt()).toBeNull();
  });

  it('refuses to pay before the cart is loaded', async () => {
    await expect(store.pay(APPROVED_CARD)).rejects.toThrow();
  });
});
