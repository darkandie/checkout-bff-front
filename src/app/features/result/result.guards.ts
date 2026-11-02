import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckoutStore } from '../../core/state/checkout.store';
import { CHECKOUT_ROUTES } from '../../core/state/checkout-flow';

export const paymentSucceededGuard: CanActivateFn = () =>
  inject(CheckoutStore).result() !== null || redirectToPayment();

export const paymentFailedGuard: CanActivateFn = () =>
  inject(CheckoutStore).failure() !== null || redirectToPayment();

function redirectToPayment() {
  const plan = inject(CheckoutStore).plan();
  return inject(Router).createUrlTree([CHECKOUT_ROUTES.payment], {
    queryParams: plan ? { plano: plan } : {},
  });
}
