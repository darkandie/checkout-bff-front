import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CHECKOUT_CONFIG } from '../config/checkout-config';
import {
  CheckoutRequest,
  CheckoutResponse,
  PreCheckoutRequest,
  PreCheckoutResponse,
} from '../models/checkout.models';
import { toCheckoutError } from './checkout-error';

@Injectable({ providedIn: 'root' })
export class CheckoutApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(CHECKOUT_CONFIG).apiBaseUrl;

  preCheckout(productSlugs: string[]): Observable<PreCheckoutResponse> {
    const body: PreCheckoutRequest = { products: productSlugs.map((slug) => ({ slug })) };
    return this.http
      .post<PreCheckoutResponse>(`${this.baseUrl}/operations/pre-checkout`, body)
      .pipe(catchError((error: unknown) => throwError(() => toCheckoutError(error))));
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http
      .post<CheckoutResponse>(`${this.baseUrl}/operations/checkout`, request)
      .pipe(catchError((error: unknown) => throwError(() => toCheckoutError(error, request.cartId))));
  }
}
