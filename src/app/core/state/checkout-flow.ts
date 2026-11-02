import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CardPayload, ErrorAction } from '../models/checkout.models';
import { CheckoutStore, PaymentOutcome } from './checkout.store';

export const CHECKOUT_ROUTES = {
  payment: '/checkout/pagamento',
  success: '/checkout/sucesso',
  failure: '/checkout/erro',
} as const;

const RETRY_ACTION = 'RETRY';
const PLANS_ACTION = '/planos';

@Injectable({ providedIn: 'root' })
export class CheckoutFlow {
  private readonly store = inject(CheckoutStore);
  private readonly router = inject(Router);

  async pay(card?: CardPayload): Promise<void> {
    await this.follow(await this.store.pay(card));
  }

  async retry(): Promise<void> {
    if (!this.store.canRetry()) {
      await this.goToPayment();
      return;
    }
    await this.goToPayment(false);
    const outcome = await this.store.retry();
    await this.follow(outcome ?? 'intervention');
  }

  async startOver(): Promise<void> {
    const reload = this.store.restart();
    await this.goToPayment(false);
    await reload;
  }

  async goToPayment(resetFailure = true): Promise<void> {
    if (resetFailure) {
      this.store.backToPayment();
    }
    await this.router.navigate([CHECKOUT_ROUTES.payment], { queryParams: this.planParams() });
  }

  isAvailable(action: ErrorAction | null): action is ErrorAction {
    if (!action) {
      return false;
    }
    switch (action.url) {
      case RETRY_ACTION:
      case PLANS_ACTION:
      case CHECKOUT_ROUTES.payment:
        return true;
      case CHECKOUT_ROUTES.success:
        return this.store.result() !== null;
      default:
        return false;
    }
  }

  async run(action: ErrorAction): Promise<void> {
    switch (action.url) {
      case RETRY_ACTION:
        return this.retry();
      case PLANS_ACTION:
        return this.startOver();
      case CHECKOUT_ROUTES.success:
        await this.router.navigateByUrl(CHECKOUT_ROUTES.success);
        return;
      default:
        return this.goToPayment();
    }
  }

  private async follow(outcome: PaymentOutcome): Promise<void> {
    if (outcome === 'success') {
      await this.router.navigateByUrl(CHECKOUT_ROUTES.success);
    } else if (outcome === 'failure') {
      await this.router.navigateByUrl(CHECKOUT_ROUTES.failure);
    } else {
      await this.router.navigate([CHECKOUT_ROUTES.payment], { queryParams: this.planParams() });
    }
  }

  private planParams(): Record<string, string> {
    const plan = this.store.plan();
    return plan ? { plano: plan } : {};
  }
}
