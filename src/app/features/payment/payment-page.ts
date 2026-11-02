import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CHECKOUT_CONFIG } from '../../core/config/checkout-config';
import { CardPayload, PaymentMethodType } from '../../core/models/checkout.models';
import { CheckoutFlow } from '../../core/state/checkout-flow';
import { CheckoutStore } from '../../core/state/checkout.store';
import { CheckoutStepper } from '../../layout/checkout-stepper';
import { paymentLabel } from '../../shared/payment/payment-labels';
import { Notice } from '../../shared/ui/notice';
import { CardPaymentForm } from './card-payment-form';
import { OrderSummary } from './order-summary';
import { PaymentMethodSelector } from './payment-method-selector';
import { PixPaymentPanel } from './pix-payment-panel';
import { ProcessingPanel } from './processing-panel';

@Component({
  selector: 'app-payment-page',
  imports: [
    RouterLink,
    CheckoutStepper,
    Notice,
    OrderSummary,
    PaymentMethodSelector,
    CardPaymentForm,
    PixPaymentPanel,
    ProcessingPanel,
  ],
  templateUrl: './payment-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPage implements OnInit {
  readonly plano = input<string>();

  protected readonly store = inject(CheckoutStore);
  protected readonly defaultPlan = inject(CHECKOUT_CONFIG).defaultPlan;
  private readonly flow = inject(CheckoutFlow);

  protected readonly product = computed(() => this.store.products()[0] ?? null);
  protected readonly method = computed(() => this.store.selectedMethod());
  protected readonly isPix = computed(() => this.method()?.type === 'PIX');
  protected readonly cardType = computed(() =>
    this.method()?.type === 'DEBIT_CARD' ? 'DEBIT_CARD' : 'CREDIT_CARD',
  );
  protected readonly attemptLabel = computed(() => paymentLabel(this.store.attempt()));

  ngOnInit(): void {
    void this.store.loadCart(this.plano());
  }

  protected selectMethod(type: PaymentMethodType): void {
    this.store.selectMethod(type);
  }

  protected payWithCard(card: CardPayload): void {
    void this.flow.pay(card);
  }

  protected payWithPix(): void {
    void this.flow.pay();
  }

  protected reload(): void {
    void this.store.restart();
  }
}
