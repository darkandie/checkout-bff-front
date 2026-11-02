import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CheckoutFlow } from './checkout-flow';
import { CheckoutStore, PaymentOutcome } from './checkout.store';

@Component({ template: '' })
class Blank {}

describe('CheckoutFlow', () => {
  let flow: CheckoutFlow;
  let router: Router;
  let store: {
    plan: () => string | null;
    result: () => unknown;
    pay: ReturnType<typeof vi.fn<() => Promise<PaymentOutcome>>>;
    retry: ReturnType<typeof vi.fn<() => Promise<PaymentOutcome | null>>>;
    canRetry: ReturnType<typeof vi.fn<() => boolean>>;
    restart: ReturnType<typeof vi.fn<() => Promise<void>>>;
    backToPayment: ReturnType<typeof vi.fn<() => void>>;
  };

  beforeEach(() => {
    store = {
      plan: () => 'familia',
      result: () => null,
      pay: vi.fn(),
      retry: vi.fn(),
      canRetry: vi.fn(() => true),
      restart: vi.fn(() => Promise.resolve()),
      backToPayment: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Blank }]),
        { provide: CheckoutStore, useValue: store },
      ],
    });
    flow = TestBed.inject(CheckoutFlow);
    router = TestBed.inject(Router);
  });

  it.each<[PaymentOutcome, string]>([
    ['success', '/checkout/sucesso'],
    ['failure', '/checkout/erro'],
    ['intervention', '/checkout/pagamento?plano=familia'],
  ])('navigates after a %s', async (outcome, url) => {
    store.pay.mockResolvedValueOnce(outcome);

    await flow.pay();

    expect(router.url).toBe(url);
  });

  it('retries the last attempt from the payment screen', async () => {
    store.retry.mockResolvedValueOnce('success');

    await flow.run({ label: 'Tentar novamente', url: 'RETRY' });

    expect(store.retry).toHaveBeenCalled();
    expect(store.backToPayment).not.toHaveBeenCalled();
    expect(router.url).toBe('/checkout/sucesso');
  });

  it('goes back to payment when there is nothing to retry', async () => {
    store.canRetry.mockReturnValueOnce(false);

    await flow.run({ label: 'Tentar novamente', url: 'RETRY' });

    expect(store.retry).not.toHaveBeenCalled();
    expect(store.backToPayment).toHaveBeenCalled();
    expect(router.url).toBe('/checkout/pagamento?plano=familia');
  });

  it('changes the payment method by returning to the payment screen', async () => {
    await flow.run({ label: 'Trocar meio de pagamento', url: '/checkout/pagamento' });

    expect(store.backToPayment).toHaveBeenCalled();
    expect(router.url).toBe('/checkout/pagamento?plano=familia');
  });

  it('starts over with a new cart when asked to choose a plan', async () => {
    await flow.run({ label: 'Escolher plano', url: '/planos' });

    expect(store.restart).toHaveBeenCalled();
    expect(router.url).toBe('/checkout/pagamento?plano=familia');
  });

  it('only offers actions it can perform', () => {
    expect(flow.isAvailable({ label: 'Tentar novamente', url: 'RETRY' })).toBe(true);
    expect(flow.isAvailable({ label: 'Ver confirmação', url: '/checkout/sucesso' })).toBe(false);
    expect(flow.isAvailable({ label: 'Outro', url: '/desconhecido' })).toBe(false);
    expect(flow.isAvailable(null)).toBe(false);
  });
});
