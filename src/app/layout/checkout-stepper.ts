import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../shared/ui/icon';

export type CheckoutStep = 'payment' | 'done';

interface StepView {
  label: string;
  state: 'done' | 'current' | 'upcoming';
  position: number;
}

@Component({
  selector: 'app-checkout-stepper',
  imports: [Icon],
  template: `
    <nav aria-label="Etapas do checkout" class="no-print">
      <ol class="flex items-center gap-2 sm:gap-4">
        @for (step of steps(); track step.label; let last = $last) {
          <li
            class="flex items-center gap-2 text-xs sm:text-sm"
            [attr.aria-current]="step.state === 'current' ? 'step' : null"
          >
            @switch (step.state) {
              @case ('done') {
                <span class="text-emerald-600"><app-icon name="check" [size]="16" /></span>
                <span class="text-slate-600">{{ step.label }}</span>
              }
              @case ('current') {
                <span
                  class="grid size-5 place-items-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white"
                >
                  {{ step.position }}
                </span>
                <span class="font-medium text-slate-900">{{ step.label }}</span>
              }
              @default {
                <span
                  class="grid size-5 place-items-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-500"
                >
                  {{ step.position }}
                </span>
                <span class="text-slate-400">{{ step.label }}</span>
              }
            }
          </li>
          @if (!last) {
            <li aria-hidden="true" class="h-px flex-1 bg-slate-200"></li>
          }
        }
      </ol>
    </nav>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutStepper {
  readonly current = input.required<CheckoutStep>();

  protected readonly steps = computed<StepView[]>(() => {
    const current = this.current();
    return [
      { label: 'Pedido', state: 'done', position: 1 },
      { label: 'Pagamento', state: current === 'payment' ? 'current' : 'done', position: 2 },
      {
        label: 'Confirmação',
        state: current === 'done' ? 'done' : 'upcoming',
        position: 3,
      },
    ];
  });
}
