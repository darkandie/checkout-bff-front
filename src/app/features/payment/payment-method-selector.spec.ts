import { TestBed } from '@angular/core/testing';
import { PaymentMethodType } from '../../core/models/checkout.models';
import { toPaymentMethodChoices } from '../../core/models/payment-method';
import { CART } from '../../../testing/fixtures';
import { PaymentMethodSelector } from './payment-method-selector';

describe('PaymentMethodSelector', () => {
  it('renders one radio per method and emits the chosen type', async () => {
    const fixture = TestBed.createComponent(PaymentMethodSelector);
    fixture.componentRef.setInput('methods', toPaymentMethodChoices(CART.paymentMethods));
    fixture.componentRef.setInput('selected', 'CREDIT_CARD');
    const chosen: PaymentMethodType[] = [];
    fixture.componentInstance.selectedChange.subscribe((type) => chosen.push(type));
    await fixture.whenStable();

    const radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type=radio]'),
    ) as HTMLInputElement[];
    radios[2].click();

    expect(radios.map((radio) => radio.value)).toEqual(['CREDIT_CARD', 'DEBIT_CARD', 'PIX']);
    expect(radios[0].checked).toBe(false);
    expect(chosen).toEqual(['PIX']);
    expect(fixture.nativeElement.textContent).toContain('Crédito');
  });
});
