import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';

export type NoticeTone = 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-notice',
  imports: [Icon],
  template: `
    <div
      class="flex gap-3 rounded-lg border p-3 text-sm"
      [class]="toneClasses[tone()]"
      [attr.role]="tone() === 'info' ? 'status' : 'alert'"
    >
      <app-icon [name]="tone() === 'info' ? 'info' : 'alert'" [size]="18" class="mt-0.5" />
      <div class="flex-1">
        <p class="font-semibold">{{ title() }}</p>
        @if (description()) {
          <p class="mt-0.5 opacity-90">{{ description() }}</p>
        }
        <ng-content />
      </div>
      @if (dismissible()) {
        <button
          type="button"
          class="h-fit rounded p-0.5 opacity-70 hover:opacity-100"
          aria-label="Fechar aviso"
          (click)="dismissed.emit()"
        >
          <app-icon name="x" [size]="16" />
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notice {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly tone = input<NoticeTone>('danger');
  readonly dismissible = input(false);
  readonly dismissed = output<void>();

  protected readonly toneClasses: Record<NoticeTone, string> = {
    danger: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-indigo-100 bg-indigo-50 text-indigo-900',
  };
}
