import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../../shared/ui/icon';

export interface PurchaseLine {
  name: string;
  description?: string;
}

export interface PurchaseDetail {
  label: string;
  value: string;
}

@Component({
  selector: 'app-purchase-card',
  imports: [CurrencyPipe, Icon],
  template: `
    <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-left sm:p-5">
      @for (line of lines(); track line.name) {
        <div class="flex items-center gap-3" [class.mt-3]="!$first">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"
          >
            <app-icon name="grid" [size]="20" />
          </span>
          <div>
            <p class="font-semibold text-slate-900">{{ line.name }}</p>
            @if (line.description) {
              <p class="text-xs text-slate-500">{{ line.description }}</p>
            }
          </div>
        </div>
      }

      <dl class="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
        @for (detail of details(); track detail.label) {
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500">{{ detail.label }}</dt>
            <dd class="text-right font-medium text-slate-900">{{ detail.value }}</dd>
          </div>
        }
        <div class="flex items-baseline justify-between border-t border-slate-200 pt-3">
          <dt class="font-semibold text-slate-900">{{ totalLabel() }}</dt>
          <dd class="text-2xl font-bold text-slate-900">{{ total() | currency }}</dd>
        </div>
      </dl>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseCard {
  readonly lines = input.required<PurchaseLine[]>();
  readonly details = input.required<PurchaseDetail[]>();
  readonly totalLabel = input.required<string>();
  readonly total = input.required<number>();
}
