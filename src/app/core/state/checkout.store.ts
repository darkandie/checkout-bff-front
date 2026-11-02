import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CheckoutApi } from '../api/checkout-api';
import { toCheckoutError } from '../api/checkout-error';
import { CHECKOUT_CONFIG } from '../config/checkout-config';
import {
  CardPayload,
  CheckoutRequest,
  CheckoutResponse,
  FrontendErrorResponse,
  PaymentMethodType,
  PreCheckoutResponse,
} from '../models/checkout.models';
import { PaymentMethodChoice, toPaymentMethodChoices } from '../models/payment-method';
import { CardBrand, detectCardBrand, lastDigits } from '../../shared/payment/card-number';

export type CheckoutStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'processing';

export type PaymentOutcome = 'success' | 'failure' | 'intervention';

export interface PaymentAttemptSummary {
  type: PaymentMethodType;
  methodName: string;
  shortLabel: string;
  brand: CardBrand | null;
  lastDigits: string | null;
  holderName: string | null;
}

interface CheckoutState {
  status: CheckoutStatus;
  plan: string | null;
  cart: PreCheckoutResponse | null;
  selectedMethod: PaymentMethodType;
  attempt: PaymentAttemptSummary | null;
  result: CheckoutResponse | null;
  failure: FrontendErrorResponse | null;
  intervention: FrontendErrorResponse | null;
  loadError: FrontendErrorResponse | null;
}

const INITIAL_STATE: CheckoutState = {
  status: 'idle',
  plan: null,
  cart: null,
  selectedMethod: 'CREDIT_CARD',
  attempt: null,
  result: null,
  failure: null,
  intervention: null,
  loadError: null,
};

@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  private readonly api = inject(CheckoutApi);
  private readonly defaultPlan = inject(CHECKOUT_CONFIG).defaultPlan;
  private readonly state = signal<CheckoutState>(INITIAL_STATE);
  private pendingRequest: CheckoutRequest | null = null;
  private loading: Promise<void> | null = null;

  readonly status = computed(() => this.state().status);
  readonly plan = computed(() => this.state().plan);
  readonly cart = computed(() => this.state().cart);
  readonly products = computed(() => this.state().cart?.products ?? []);
  readonly total = computed(() => this.products().reduce((sum, product) => sum + product.price, 0));
  readonly paymentMethods = computed(() =>
    toPaymentMethodChoices(this.state().cart?.paymentMethods ?? []),
  );
  readonly selectedMethod = computed<PaymentMethodChoice | null>(
    () =>
      this.paymentMethods().find((method) => method.type === this.state().selectedMethod) ?? null,
  );
  readonly attempt = computed(() => this.state().attempt);
  readonly result = computed(() => this.state().result);
  readonly failure = computed(() => this.state().failure);
  readonly intervention = computed(() => this.state().intervention);
  readonly loadError = computed(() => this.state().loadError);
  readonly isProcessing = computed(() => this.state().status === 'processing');

  loadCart(plan?: string | null): Promise<void> {
    const current = this.state();
    const requestedPlan = plan ?? current.plan ?? this.defaultPlan;
    if (current.plan === requestedPlan && this.loading) {
      return this.loading;
    }
    if (current.cart && current.plan === requestedPlan && !current.result) {
      return Promise.resolve();
    }
    this.pendingRequest = null;
    this.state.set({ ...INITIAL_STATE, status: 'loading', plan: requestedPlan });
    const loading = this.fetchCart(requestedPlan).finally(() => {
      if (this.loading === loading) {
        this.loading = null;
      }
    });
    this.loading = loading;
    return loading;
  }

  canRetry(): boolean {
    return this.state().failure !== null && this.pendingRequest !== null;
  }

  selectMethod(type: PaymentMethodType): void {
    this.state.update((state) => ({ ...state, selectedMethod: type, intervention: null }));
  }

  async pay(card?: CardPayload): Promise<PaymentOutcome> {
    const cart = this.state().cart;
    const method = this.selectedMethod();
    if (!cart || !method) {
      throw new Error('Cannot pay without a loaded cart and a selected payment method');
    }
    this.pendingRequest = {
      cartId: cart.cartId,
      paymentMethod:
        method.type === 'PIX' || !card ? { name: method.name } : { name: method.name, card },
    };
    this.state.update((state) => ({ ...state, attempt: summarize(method, card) }));
    return this.submit(this.pendingRequest);
  }

  async retry(): Promise<PaymentOutcome | null> {
    if (!this.pendingRequest) {
      return null;
    }
    return this.submit(this.pendingRequest);
  }

  dismissIntervention(): void {
    this.state.update((state) => ({ ...state, intervention: null }));
  }

  backToPayment(): void {
    this.state.update((state) => ({
      ...state,
      status: state.cart ? 'ready' : 'idle',
      failure: null,
      intervention: null,
    }));
  }

  restart(): Promise<void> {
    const plan = this.state().plan;
    this.pendingRequest = null;
    this.loading = null;
    this.state.set({ ...INITIAL_STATE, plan });
    return this.loadCart(plan);
  }

  private async fetchCart(plan: string): Promise<void> {
    try {
      const cart = await firstValueFrom(this.api.preCheckout([plan]));
      const choices = toPaymentMethodChoices(cart.paymentMethods);
      this.state.update((state) => ({
        ...state,
        status: 'ready',
        cart,
        selectedMethod: choices[0]?.type ?? 'CREDIT_CARD',
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        status: 'unavailable',
        loadError: toCheckoutError(error).response,
      }));
    }
  }

  private async submit(request: CheckoutRequest): Promise<PaymentOutcome> {
    this.state.update((state) => ({
      ...state,
      status: 'processing',
      failure: null,
      intervention: null,
    }));
    try {
      const result = await firstValueFrom(this.api.checkout(request));
      this.pendingRequest = null;
      this.state.update((state) => ({ ...state, status: 'ready', result }));
      return 'success';
    } catch (error) {
      const response = toCheckoutError(error, request.cartId).response;
      if (response.displayType === 'INTERVENTION') {
        this.state.update((state) => ({ ...state, status: 'ready', intervention: response }));
        return 'intervention';
      }
      this.state.update((state) => ({ ...state, status: 'ready', failure: response }));
      return 'failure';
    }
  }
}

function summarize(
  method: PaymentMethodChoice,
  card: CardPayload | undefined,
): PaymentAttemptSummary {
  const usesCard = method.type !== 'PIX' && card !== undefined;
  return {
    type: method.type,
    methodName: method.name,
    shortLabel: method.shortLabel,
    brand: usesCard ? detectCardBrand(card.number) : null,
    lastDigits: usesCard ? lastDigits(card.number) : null,
    holderName: usesCard ? card.holderName : null,
  };
}
