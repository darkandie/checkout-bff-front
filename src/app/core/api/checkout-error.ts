import { HttpErrorResponse } from '@angular/common/http';
import { FrontendErrorResponse } from '../models/checkout.models';

export const UNAVAILABLE_ERROR: FrontendErrorResponse = {
  displayType: 'BLOCK',
  errorCode: 'EXTERNAL_SERVICE_UNAVAILABLE',
  cartId: null,
  frontendError: {
    code: 'P-9001',
    title: 'Serviço indisponível',
    description: 'Estamos com instabilidade no momento. Tente novamente em alguns instantes.',
    primaryButton: { label: 'Tentar novamente', url: 'RETRY' },
    secondaryButton: null,
  },
};

export class CheckoutError extends Error {
  constructor(readonly response: FrontendErrorResponse) {
    super(response.frontendError.title);
    this.name = 'CheckoutError';
  }
}

export function toCheckoutError(error: unknown, cartId: string | null = null): CheckoutError {
  if (error instanceof CheckoutError) {
    return error;
  }
  if (error instanceof HttpErrorResponse && isFrontendErrorResponse(error.error)) {
    return new CheckoutError(error.error);
  }
  return new CheckoutError({ ...UNAVAILABLE_ERROR, cartId });
}

export function isFrontendErrorResponse(value: unknown): value is FrontendErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<FrontendErrorResponse>;
  return (
    (candidate.displayType === 'BLOCK' || candidate.displayType === 'INTERVENTION') &&
    typeof candidate.errorCode === 'string' &&
    typeof candidate.frontendError?.title === 'string'
  );
}
