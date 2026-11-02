import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { create } from 'qrcode';
import { buildPixCode } from '../../shared/payment/pix-code';
import { Icon } from '../../shared/ui/icon';

const COPY_FEEDBACK_MS = 2500;

@Component({
  selector: 'app-pix-payment-panel',
  imports: [CurrencyPipe, Icon],
  template: `
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">Pague com seu app do banco</h3>
        <p class="mt-1 text-sm text-slate-500">
          Abra a opção Pix e escaneie o QR Code ou use o código abaixo. Depois, conclua o pagamento.
        </p>
      </div>

      <figure class="flex flex-col items-center gap-2">
        <div class="rounded-xl border border-slate-200 bg-white p-3">
          <svg
            class="size-40"
            [attr.viewBox]="qrCode().viewBox"
            shape-rendering="crispEdges"
            role="img"
            aria-label="QR Code Pix simulado"
          >
            <rect width="100%" height="100%" fill="#fff" />
            <path [attr.d]="qrCode().path" fill="#0f172a" />
          </svg>
        </div>
        <figcaption class="text-xs text-slate-500">
          QR Code simulado · sem valor de pagamento
        </figcaption>
      </figure>

      <div>
        <label for="pix-code" class="mb-1.5 block text-sm font-medium text-slate-700"
          >Pix copia e cola</label
        >
        <div class="relative">
          <input
            id="pix-code"
            type="text"
            readonly
            class="field truncate pr-11 font-mono text-xs text-slate-600"
            [value]="code()"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-2 my-auto h-fit rounded p-1 text-slate-500 hover:text-indigo-600"
            aria-label="Copiar código Pix"
            (click)="copy()"
          >
            <app-icon name="copy" [size]="18" />
          </button>
        </div>
      </div>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        (click)="copy()"
      >
        <app-icon [name]="copied() ? 'check' : 'copy'" [size]="16" />
        {{ copied() ? 'Código copiado' : 'Copiar código Pix' }}
      </button>
      <span class="sr-only" aria-live="polite">{{ copied() ? 'Código Pix copiado' : '' }}</span>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        [disabled]="disabled()"
        (click)="confirmed.emit()"
      >
        <app-icon name="arrow-right" [size]="16" />
        Concluir pagamento de {{ total() | currency }}
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixPaymentPanel {
  readonly cartId = input.required<string>();
  readonly total = input.required<number>();
  readonly disabled = input(false);
  readonly confirmed = output<void>();

  protected readonly copied = signal(false);
  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly code = computed(() =>
    buildPixCode({
      key: this.cartId(),
      amount: this.total(),
      transactionId: this.cartId(),
      merchantName: 'Nexo Assinaturas',
      merchantCity: 'Sao Paulo',
    }),
  );

  protected readonly qrCode = computed(() => {
    const modules = create(this.code(), { errorCorrectionLevel: 'M' }).modules;
    const quietZone = 2;
    const size = modules.size + quietZone * 2;
    let path = '';
    for (let row = 0; row < modules.size; row++) {
      for (let column = 0; column < modules.size; column++) {
        if (modules.get(row, column)) {
          path += `M${column + quietZone} ${row + quietZone}h1v1h-1z`;
        }
      }
    }
    return { viewBox: `0 0 ${size} ${size}`, path };
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.copied.set(false), COPY_FEEDBACK_MS);
    } catch {
      document.querySelector<HTMLInputElement>('#pix-code')?.select();
    }
  }
}
