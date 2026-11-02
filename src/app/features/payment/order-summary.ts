import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../core/models/checkout.models';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, Icon],
  template: `
    <section
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="order-summary-title"
    >
      <h2 id="order-summary-title" class="text-base font-semibold text-slate-900">
        Resumo do pedido
      </h2>

      <ul class="mt-4 space-y-4">
        @for (product of products(); track product.slug) {
          <li class="flex gap-3">
            <span
              class="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"
            >
              <app-icon name="grid" [size]="22" />
            </span>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900">{{ product.name }}</p>
              <p class="text-sm text-slate-500">{{ product.description }}</p>
            </div>
          </li>
        }
      </ul>

      <dl class="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div class="flex justify-between">
          <dt class="text-slate-500">Subtotal</dt>
          <dd class="font-medium">{{ total() | currency }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Taxas</dt>
          <dd class="font-medium">{{ 0 | currency }}</dd>
        </div>
        <div class="flex items-baseline justify-between border-t border-slate-100 pt-3">
          <dt class="font-semibold text-slate-900">Total hoje</dt>
          <dd class="text-2xl font-bold text-slate-900">{{ total() | currency }}</dd>
        </div>
      </dl>

      <p class="mt-4 text-xs leading-relaxed text-slate-500">
        Renovação mensal. Cancele quando quiser, sem taxas adicionais.
      </p>
    </section>

    <p class="mt-4 flex gap-2 px-1 text-xs text-slate-500">
      <span class="text-indigo-600"><app-icon name="shield" [size]="18" /></span>
      <span>
        <strong class="block font-semibold text-slate-700">Seus dados estão protegidos</strong>
        Pagamento criptografado. Não armazenamos o número completo nem o CVV do seu cartão.
      </span>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummary {
  readonly products = input.required<Product[]>();
  readonly total = input.required<number>();
}
