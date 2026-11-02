import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CLOCK } from '../../core/config/clock';
import { CardPayload } from '../../core/models/checkout.models';
import {
  cardBrandLabel,
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  formatExpiry,
} from '../../shared/payment/card-number';
import {
  cardNumberValidator,
  cvvValidator,
  expiryValidator,
  holderNameValidator,
} from '../../shared/payment/card-validators';
import { Icon } from '../../shared/ui/icon';

type CardField = 'number' | 'holderName' | 'expiry' | 'cvv';

const ERROR_MESSAGES: Record<CardField, Record<string, string>> = {
  number: {
    required: 'Informe o número do cartão.',
    cardNumber: 'Número inválido. Confira os dígitos do cartão.',
  },
  holderName: {
    required: 'Informe o nome como aparece no cartão.',
    holderName: 'Use apenas letras, como aparece no cartão.',
  },
  expiry: {
    required: 'Informe a validade.',
    expiryFormat: 'Use o formato MM/AA.',
    expired: 'Cartão vencido.',
  },
  cvv: {
    required: 'Informe o CVV.',
    cvv: 'Use 3 ou 4 dígitos.',
  },
};

@Component({
  selector: 'app-card-payment-form',
  imports: [ReactiveFormsModule, CurrencyPipe, Icon],
  templateUrl: './card-payment-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPaymentForm {
  readonly methodType = input.required<'CREDIT_CARD' | 'DEBIT_CARD'>();
  readonly total = input.required<number>();
  readonly disabled = input(false);
  readonly submitted = output<CardPayload>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly form = inject(NonNullableFormBuilder).group({
    number: ['', [Validators.required, cardNumberValidator()]],
    holderName: ['', [Validators.required, holderNameValidator()]],
    expiry: ['', [Validators.required, expiryValidator(inject(CLOCK))]],
    cvv: ['', [Validators.required, cvvValidator()]],
  });

  protected readonly attempted = signal(false);
  private readonly number = toSignal(this.form.controls.number.valueChanges, { initialValue: '' });
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  protected readonly title = computed(() =>
    this.methodType() === 'CREDIT_CARD' ? 'Cartão de crédito' : 'Cartão de débito',
  );
  protected readonly brand = computed(() => detectCardBrand(this.number()));
  protected readonly brandLabel = computed(() =>
    this.brand() === 'unknown' ? null : cardBrandLabel(this.brand()),
  );
  protected readonly complete = computed(() => this.status() === 'VALID');

  protected errorFor(field: CardField): string | null {
    const control = this.form.controls[field];
    if (!control.invalid || !(control.touched || this.attempted())) {
      return null;
    }
    const errorKey = Object.keys(control.errors ?? {})[0];
    return errorKey ? (ERROR_MESSAGES[field][errorKey] ?? null) : null;
  }

  protected onNumberInput(event: Event): void {
    this.reformat(event, 'number', formatCardNumber);
  }

  protected onExpiryInput(event: Event): void {
    this.reformat(event, 'expiry', formatExpiry);
  }

  protected onCvvInput(event: Event): void {
    this.reformat(event, 'cvv', (value) => digitsOnly(value).slice(0, 4));
  }

  protected submit(): void {
    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    const value = this.form.getRawValue();
    this.submitted.emit({
      holderName: value.holderName.trim(),
      number: digitsOnly(value.number),
      expiry: value.expiry,
      cvv: value.cvv,
    });
  }

  private reformat(event: Event, field: CardField, format: (value: string) => string): void {
    const element = event.target as HTMLInputElement;
    const formatted = format(element.value);
    if (formatted !== element.value) {
      element.value = formatted;
    }
    this.form.controls[field].setValue(formatted);
  }

  private focusFirstInvalid(): void {
    queueMicrotask(() =>
      this.host.nativeElement
        .querySelector<HTMLInputElement>('input[aria-invalid="true"]')
        ?.focus(),
    );
  }
}
