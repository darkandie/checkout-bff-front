import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { fixedClock, textOf } from '../testing/fixtures';
import { routes } from './app.routes';
import { CHECKOUT_CONFIG } from './core/config/checkout-config';
import { CLOCK } from './core/config/clock';
import { MOCK_LATENCY_MS, mockBackendInterceptor } from './core/mock/mock-backend.interceptor';

describe('checkout journey', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([mockBackendInterceptor])),
        {
          provide: CHECKOUT_CONFIG,
          useValue: { apiBaseUrl: '', useMockBackend: true, defaultPlan: 'premium' },
        },
        { provide: MOCK_LATENCY_MS, useValue: 0 },
        { provide: CLOCK, useValue: fixedClock },
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  const page = () => harness.fixture.nativeElement as HTMLElement;

  const settle = async () => {
    for (let round = 0; round < 3; round++) {
      await harness.fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
  };

  const open = async (url: string) => {
    await harness.navigateByUrl(url);
    await settle();
  };

  const type = (id: string, value: string) => {
    const input = page().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  };

  const fillCard = async (number: string) => {
    type('card-number', number);
    type('card-holder', 'Marina Almeida');
    type('card-expiry', '12/30');
    type('card-cvv', '123');
    await settle();
  };

  const click = async (label: string) => {
    const target = Array.from(page().querySelectorAll<HTMLElement>('button, label, a')).find(
      (element) => textOf(element).includes(label),
    );
    if (!target) {
      throw new Error(`No clickable element with "${label}"`);
    }
    target.click();
    await settle();
  };

  it('pays with a credit card and shows the confirmation', async () => {
    await open('/checkout/pagamento');

    expect(textOf(page())).toContain('Falta só um passo para começar com o Plano Premium.');

    await fillCard('4242 4242 4242 4242');
    await click('Pagar R$ 39,90');

    expect(router.url).toBe('/checkout/sucesso');
    expect(textOf(page())).toContain('Pagamento confirmado!');
    expect(textOf(page())).toContain('Tudo certo, Marina.');
    expect(textOf(page())).toContain('Crédito · Visa •••• 4242');
    expect(textOf(page())).toContain('31/10/2026');
    expect(textOf(page())).toContain('Sua próxima renovação será em 30/11/2026.');
  });

  it('shows the error screen for a declined card and recovers with Pix', async () => {
    await open('/checkout/pagamento?plano=familia');
    await fillCard('4000 0000 0000 0002');
    await click('Pagar R$ 59,90');

    expect(router.url).toBe('/checkout/erro');
    expect(textOf(page())).toContain('Não foi possível concluir o pagamento');
    expect(textOf(page())).toContain('Pagamento não aprovado');
    expect(textOf(page())).toContain('Crédito · Visa •••• 0002');

    await click('Tentar novamente');

    expect(router.url).toBe('/checkout/erro');

    await click('Trocar meio de pagamento');

    expect(router.url).toBe('/checkout/pagamento?plano=familia');

    await click('Pix');

    expect(
      page().querySelector('svg[aria-label="QR Code Pix simulado"] path')?.getAttribute('d'),
    ).toBeTruthy();

    await click('Concluir pagamento');

    expect(router.url).toBe('/checkout/sucesso');
    expect(textOf(page())).toContain('Plano Família');
    expect(textOf(page())).toMatch(/Pagamento\s*Pix/);
  });

  it('pays with a debit card', async () => {
    await open('/checkout/pagamento');
    await click('Débito');

    expect(textOf(page())).toContain('Cartão de débito');

    await fillCard('5555 5555 5555 4444');
    await click('Pagar');

    expect(textOf(page())).toContain('Débito · Mastercard •••• 4444');
  });

  it.each(['/checkout/sucesso', '/checkout/erro'])(
    'redirects %s to payment when there is no result',
    async (url) => {
      await open(url);

      expect(router.url).toBe('/checkout/pagamento');
      expect(textOf(page())).toContain('Finalize sua assinatura');
    },
  );

  it('explains when the requested plan does not exist', async () => {
    await open('/checkout/pagamento?plano=ultra');

    expect(textOf(page())).toContain('Produto indisponível');
    expect(textOf(page())).toContain('Ver plano disponível');
  });
});
