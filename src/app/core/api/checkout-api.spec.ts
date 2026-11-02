import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CART, CARD_RESULT, errorResponse } from '../../../testing/fixtures';
import { CHECKOUT_CONFIG } from '../config/checkout-config';
import { CheckoutApi } from './checkout-api';
import { CheckoutError, isFrontendErrorResponse, toCheckoutError } from './checkout-error';

describe('CheckoutApi', () => {
  let api: CheckoutApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CHECKOUT_CONFIG,
          useValue: { apiBaseUrl: 'http://bff', useMockBackend: false, defaultPlan: 'premium' },
        },
      ],
    });
    api = TestBed.inject(CheckoutApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the selected slugs to the pre-checkout operation', async () => {
    const response = firstValueFrom(api.preCheckout(['premium']));

    const request = http.expectOne('http://bff/operations/pre-checkout');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ products: [{ slug: 'premium' }] });
    request.flush(CART);

    await expect(response).resolves.toEqual(CART);
  });

  it('posts the payment to the checkout operation', async () => {
    const body = { cartId: CART.cartId, paymentMethod: { name: 'Pix' } };
    const response = firstValueFrom(api.checkout(body));

    const request = http.expectOne('http://bff/operations/checkout');
    expect(request.request.body).toEqual(body);
    request.flush(CARD_RESULT);

    await expect(response).resolves.toEqual(CARD_RESULT);
  });

  it('exposes the frontend error returned by the API', async () => {
    const response = firstValueFrom(
      api.checkout({ cartId: CART.cartId, paymentMethod: { name: 'Pix' } }),
    );

    http.expectOne('http://bff/operations/checkout').flush(errorResponse('PAYMENT_DECLINED'), {
      status: 422,
      statusText: 'Unprocessable Entity',
    });

    const error = await response.catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(CheckoutError);
    expect((error as CheckoutError).response.errorCode).toBe('PAYMENT_DECLINED');
  });

  it('turns network failures into the service unavailable error', async () => {
    const response = firstValueFrom(
      api.checkout({ cartId: CART.cartId, paymentMethod: { name: 'Pix' } }),
    );

    http
      .expectOne('http://bff/operations/checkout')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    const error = (await response.catch((reason: unknown) => reason)) as CheckoutError;
    expect(error.response.errorCode).toBe('EXTERNAL_SERVICE_UNAVAILABLE');
    expect(error.response.cartId).toBe(CART.cartId);
  });
});

describe('checkout error mapping', () => {
  it('recognizes only objects in the frontend error format', () => {
    expect(isFrontendErrorResponse(errorResponse('PAYMENT_DECLINED'))).toBe(true);
    expect(isFrontendErrorResponse({ message: 'boom' })).toBe(false);
    expect(isFrontendErrorResponse(null)).toBe(false);
  });

  it('falls back to service unavailable for unexpected bodies', () => {
    const error = toCheckoutError(new HttpErrorResponse({ status: 500, error: '<html>' }));

    expect(error.response.displayType).toBe('BLOCK');
    expect(error.response.frontendError.code).toBe('P-9001');
  });
});
