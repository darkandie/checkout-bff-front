import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CheckoutFlow } from '../../core/state/checkout-flow';
import { CheckoutStore } from '../../core/state/checkout.store';
import { CheckoutStepper } from '../../layout/checkout-stepper';
import { nextBillingDate } from '../../shared/payment/billing-cycle';
import { firstName, orderCode, paymentLabel } from '../../shared/payment/payment-labels';
import { Icon } from '../../shared/ui/icon';
import { PurchaseCard, PurchaseDetail, PurchaseLine } from './purchase-card';

@Component({
  selector: 'app-success-page',
  imports: [DatePipe, CheckoutStepper, Icon, PurchaseCard],
  templateUrl: './success-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessPage {
  private readonly store = inject(CheckoutStore);
  private readonly flow = inject(CheckoutFlow);
  private readonly datePipe = new DatePipe('pt-BR');

  protected readonly result = this.store.result;

  protected readonly greeting = computed(() => {
    const name = firstName(this.store.attempt()?.holderName ?? null);
    return name ? `Tudo certo, ${name}.` : 'Tudo certo.';
  });

  protected readonly lines = computed<PurchaseLine[]>(() => {
    const descriptions = new Map(
      this.store.products().map((product) => [product.slug, product.description]),
    );
    return (this.result()?.products ?? []).map((product) => ({
      name: product.name,
      description: descriptions.get(product.slug),
    }));
  });

  protected readonly details = computed<PurchaseDetail[]>(() => {
    const result = this.result();
    if (!result) {
      return [];
    }
    return [
      { label: 'Pedido', value: orderCode(result.cartId) },
      { label: 'Pagamento', value: paymentLabel(this.store.attempt()) || result.payment.method },
      { label: 'Data', value: this.datePipe.transform(result.paidAt, 'dd/MM/yyyy, HH:mm') ?? '' },
    ];
  });

  protected readonly nextRenewal = computed(() => {
    const paidAt = this.result()?.paidAt;
    if (!paidAt) {
      return null;
    }
    return nextBillingDate(new Date(paidAt));
  });

  protected startOver(): void {
    void this.flow.startOver();
  }

  protected print(): void {
    window.print();
  }
}
