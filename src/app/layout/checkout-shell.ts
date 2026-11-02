import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CLOCK } from '../core/config/clock';
import { Icon } from '../shared/ui/icon';

@Component({
  selector: 'app-checkout-shell',
  imports: [RouterOutlet, Icon],
  template: `
    <div class="flex min-h-dvh flex-col">
      <header class="no-print border-b border-slate-200 bg-white">
        <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span class="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900">
            <span
              class="grid size-7 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white"
              >n</span
            >
            nexo
          </span>
          <span class="flex items-center gap-1.5 text-sm text-slate-500">
            <app-icon name="lock" [size]="16" />
            Checkout seguro
          </span>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="no-print border-t border-slate-200">
        <div
          class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6"
        >
          <p>© {{ year }} Nexo. Todos os direitos reservados.</p>
          <p class="flex gap-4">
            <a
              href="mailto:ajuda@nexo.example"
              class="font-medium text-indigo-600 hover:text-indigo-700"
              >Precisa de ajuda?</a
            >
            <span>Privacidade</span>
            <span>Termos</span>
          </p>
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutShell {
  protected readonly year = inject(CLOCK)().getFullYear();
}
