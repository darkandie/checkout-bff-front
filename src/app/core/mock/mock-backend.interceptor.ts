import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { defer, delay, dematerialize, materialize, Observable, of, throwError } from 'rxjs';
import { CLOCK } from '../config/clock';
import { CheckoutRequest, PreCheckoutRequest } from '../models/checkout.models';
import { MockBackendError } from './mock-errors';
import { MockCheckoutBackend } from './mock-checkout-backend';

export const MOCK_BACKEND = new InjectionToken<MockCheckoutBackend>('MOCK_BACKEND', {
  providedIn: 'root',
  factory: () => new MockCheckoutBackend(inject(CLOCK)),
});

export const MOCK_LATENCY_MS = new InjectionToken<number>('MOCK_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 1200,
});

export const mockBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const backend = inject(MOCK_BACKEND);
  const latency = inject(MOCK_LATENCY_MS);

  if (request.method === 'POST' && request.url.endsWith('/operations/pre-checkout')) {
    return respond(() => backend.preCheckout(request.body as PreCheckoutRequest), request.url, latency / 3);
  }
  if (request.method === 'POST' && request.url.endsWith('/operations/checkout')) {
    return respond(() => backend.checkout(request.body as CheckoutRequest), request.url, latency);
  }
  return next(request);
};

function respond<T>(handler: () => T, url: string, latency: number): Observable<HttpResponse<T>> {
  return defer(() => {
    try {
      return of(new HttpResponse({ status: 200, body: handler(), url }));
    } catch (error) {
      if (error instanceof MockBackendError) {
        return throwError(
          () => new HttpErrorResponse({ status: error.status, error: error.body, url }),
        );
      }
      return throwError(() => error);
    }
  }).pipe(materialize(), delay(latency), dematerialize());
}
