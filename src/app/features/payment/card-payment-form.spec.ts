import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fixedClock, textOf } from '../../../testing/fixtures';
import { CLOCK } from '../../core/config/clock';
import { CardPayload } from '../../core/models/checkout.models';
import { CardPaymentForm } from './card-payment-form';

describe('CardPaymentForm', () => {
  let fixture: ComponentFixture<CardPaymentForm>;
  let element: HTMLElement;
  let submitted: CardPayload[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPaymentForm],
      providers: [{ provide: CLOCK, useValue: fixedClock }],
    }).compileComponents();
    fixture = TestBed.createComponent(CardPaymentForm);
    fixture.componentRef.setInput('methodType', 'CREDIT_CARD');
    fixture.componentRef.setInput('total', 39.9);
    submitted = [];
    fixture.componentInstance.submitted.subscribe((payload) => submitted.push(payload));
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;

  const type = async (id: string, value: string) => {
    const field = input(id);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };

  const submit = async () => {
    element.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();
  };

  const errorText = (id: string) => element.querySelector(`#${id}-error`)?.textContent?.trim();

  it('shows the method title and the total on the submit button', () => {
    expect(element.textContent).toContain('Cartão de crédito');
    expect(textOf(element.querySelector('button[type=submit]'))).toContain('R$ 39,90');
  });

  it('shows the debit title for debit cards', async () => {
    fixture.componentRef.setInput('methodType', 'DEBIT_CARD');
    await fixture.whenStable();

    expect(element.textContent).toContain('Cartão de débito');
  });

  it('formats number and expiry while typing and detects the brand', async () => {
    await type('card-number', '4242424242424242');
    await type('card-expiry', '1230');
    await type('card-cvv', '12a3');

    expect(input('card-number').value).toBe('4242 4242 4242 4242');
    expect(input('card-expiry').value).toBe('12/30');
    expect(input('card-cvv').value).toBe('123');
    expect(element.textContent).toContain('Visa');
  });

  it('shows a message for each invalid field after it is touched', async () => {
    await type('card-number', '4242 4242 4242 4241');
    await type('card-holder', 'Ana1');
    await type('card-expiry', '0924');
    await type('card-cvv', '12');

    expect(errorText('card-number')).toBe('Número inválido. Confira os dígitos do cartão.');
    expect(errorText('card-holder')).toBe('Use apenas letras, como aparece no cartão.');
    expect(errorText('card-expiry')).toBe('Cartão vencido.');
    expect(errorText('card-cvv')).toBe('Use 3 ou 4 dígitos.');
    expect(input('card-number').getAttribute('aria-invalid')).toBe('true');
    expect(input('card-number').getAttribute('aria-describedby')).toBe('card-number-error');
  });

  it('does not submit an empty form and asks to fix the highlighted fields', async () => {
    await submit();

    expect(submitted).toEqual([]);
    expect(errorText('card-number')).toBe('Informe o número do cartão.');
    expect(errorText('card-holder')).toBe('Informe o nome como aparece no cartão.');
    expect(errorText('card-expiry')).toBe('Informe a validade.');
    expect(errorText('card-cvv')).toBe('Informe o CVV.');
    expect(element.textContent).toContain('Corrija os campos destacados para continuar.');
  });

  it('emits the card data with digits only when the form is valid', async () => {
    await type('card-number', '4242 4242 4242 4242');
    await type('card-holder', '  Marina Almeida ');
    await type('card-expiry', '12/30');
    await type('card-cvv', '123');

    expect(element.textContent).toContain('Dados do cartão preenchidos');

    await submit();

    expect(submitted).toEqual([
      { holderName: 'Marina Almeida', number: '4242424242424242', expiry: '12/30', cvv: '123' },
    ]);
  });
});
