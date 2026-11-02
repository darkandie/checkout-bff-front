import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../core/models/checkout.models';
import { Icon } from '../../shared/ui/icon';

@Component({
  selector: 'app-processing-panel',
  imports: [CurrencyPipe, Icon],
  template: `
    <div class="flex flex-col items-center text-center" role="status" aria-live="polite">
      <span
        class="size-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"
        aria-hidden="true"
      ></span>
      <h2 class="mt-4 text-lg font-semibold text-slate-900">Processando seu pagamento</h2>
      <p class="mt-1 text-sm text-slate-500">
        Estamos aguardando a confirmação. Isso pode levar alguns segundos.
      </p>
    </div>

    <div class="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
      @for (product of products(); track product.slug) {
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <app-icon name="grid" [size]="20" />
          </span>
          <div>
            <p class="font-semibold text-slate-900">{{ product.name }}</p>
            <p class="text-xs text-slate-500">{{ product.description }}</p>
          </div>
        </div>
      }
      <div class="flex justify-between">
        <span class="text-slate-500">Meio usado</span>
        <span class="font-medium">{{ paymentLabel() }}</span>
      </div>
      <div class="flex justify-between">
        <span class="font-semibold">Total</span>
        <span class="font-bold">{{ total() | currency }}</span>
      </div>
    </div>

    <div class="mt-5 flex gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
      <app-icon name="info" [size]="16" />
      <p>
        <strong class="block font-semibold">Aguarde a confirmação</strong>
        Não feche esta página nem envie o pagamento novamente.
      </p>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingPanel {
  readonly products = input.required<Product[]>();
  readonly total = input.required<number>();
  readonly paymentLabel = input.required<string>();
}
