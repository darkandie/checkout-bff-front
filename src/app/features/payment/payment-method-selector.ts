import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PaymentMethodType } from '../../core/models/checkout.models';
import { PaymentMethodChoice } from '../../core/models/payment-method';
import { Icon, IconName } from '../../shared/ui/icon';

@Component({
  selector: 'app-payment-method-selector',
  imports: [Icon],
  template: `
    <fieldset>
      <legend class="sr-only">Meio de pagamento</legend>
      <div class="grid grid-cols-3 gap-2 sm:gap-3">
        @for (method of methods(); track method.type) {
          <label
            class="relative flex cursor-pointer flex-col gap-2 rounded-xl border p-3 text-sm transition focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1"
            [class]="
              method.type === selected()
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            "
          >
            <input
              type="radio"
              name="payment-method"
              class="sr-only"
              [value]="method.type"
              [checked]="method.type === selected()"
              [disabled]="disabled()"
              (change)="selectedChange.emit(method.type)"
            />
            <span class="flex items-start justify-between">
              <app-icon [name]="icons[method.type]" [size]="20" />
              <span
                class="grid size-4 place-items-center rounded-full border"
                [class]="method.type === selected() ? 'border-indigo-600' : 'border-slate-300'"
                aria-hidden="true"
              >
                @if (method.type === selected()) {
                  <span class="size-2 rounded-full bg-indigo-600"></span>
                }
              </span>
            </span>
            <span class="font-medium">{{ method.shortLabel }}</span>
            <span class="sr-only">{{ method.name }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodSelector {
  readonly methods = input.required<PaymentMethodChoice[]>();
  readonly selected = input.required<PaymentMethodType | null>();
  readonly disabled = input(false);
  readonly selectedChange = output<PaymentMethodType>();

  protected readonly icons: Record<PaymentMethodType, IconName> = {
    CREDIT_CARD: 'credit-card',
    DEBIT_CARD: 'credit-card',
    PIX: 'pix',
  };
}
