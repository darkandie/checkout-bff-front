import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ErrorAction } from '../../core/models/checkout.models';
import { CheckoutFlow } from '../../core/state/checkout-flow';
import { CheckoutStore } from '../../core/state/checkout.store';
import { CheckoutStepper } from '../../layout/checkout-stepper';
import { orderCode, paymentLabel } from '../../shared/payment/payment-labels';
import { Icon } from '../../shared/ui/icon';
import { Notice } from '../../shared/ui/notice';
import { PurchaseCard, PurchaseDetail, PurchaseLine } from './purchase-card';

const CART_LOST_ERRORS = new Set(['CART_EXPIRED', 'CART_NOT_FOUND', 'PRODUCT_NOT_FOUND']);
const FALLBACK_ACTION: ErrorAction = { label: 'Voltar ao pagamento', url: '/checkout/pagamento' };

@Component({
  selector: 'app-failure-page',
  imports: [CheckoutStepper, Icon, Notice, PurchaseCard],
  templateUrl: './failure-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FailurePage {
  private readonly store = inject(CheckoutStore);
  private readonly flow = inject(CheckoutFlow);

  protected readonly failure = this.store.failure;
  protected readonly total = this.store.total;

  protected readonly reassurance = computed(() =>
    CART_LOST_ERRORS.has(this.failure()?.errorCode ?? '')
      ? 'Não se preocupe: nenhuma cobrança foi realizada.'
      : 'Não se preocupe: nenhuma cobrança foi realizada e seu pedido continua reservado.',
  );

  protected readonly suggestOtherMethod = computed(
    () => this.failure()?.errorCode === 'PAYMENT_DECLINED',
  );

  protected readonly actions = computed(() => {
    const error = this.failure()?.frontendError;
    const available = [error?.primaryButton ?? null, error?.secondaryButton ?? null].filter(
      (action) => this.flow.isAvailable(action),
    );
    return available.length > 0 ? available : [FALLBACK_ACTION];
  });

  protected readonly lines = computed<PurchaseLine[]>(() =>
    this.store
      .products()
      .map((product) => ({ name: product.name, description: product.description })),
  );

  protected readonly details = computed<PurchaseDetail[]>(() => {
    const cart = this.store.cart();
    const details: PurchaseDetail[] = cart
      ? [{ label: 'Pedido', value: orderCode(cart.cartId) }]
      : [];
    const method = paymentLabel(this.store.attempt());
    return method ? [...details, { label: 'Meio usado', value: method }] : details;
  });

  protected run(action: ErrorAction): void {
    void this.flow.run(action);
  }
}
