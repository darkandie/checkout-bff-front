import {
  CheckoutRequest,
  CheckoutResponse,
  PaymentMethodType,
  PreCheckoutRequest,
  PreCheckoutResponse,
  Product,
} from '../models/checkout.models';
import { resolvePaymentMethodType } from '../models/payment-method';
import { digitsOnly, lastDigits } from '../../shared/payment/card-number';
import { buildPixCode } from '../../shared/payment/pix-code';
import { Clock } from '../config/clock';
import { mockError } from './mock-errors';

export const MOCK_CATALOG: Product[] = [
  {
    slug: 'basico',
    name: 'Plano Básico',
    description: 'Assinatura mensal com catálogo essencial',
    price: 19.9,
    currency: 'BRL',
  },
  {
    slug: 'premium',
    name: 'Plano Premium',
    description: 'Assinatura mensal com catálogo completo',
    price: 39.9,
    currency: 'BRL',
  },
  {
    slug: 'familia',
    name: 'Plano Família',
    description: 'Assinatura mensal com catálogo completo para até 4 perfis',
    price: 59.9,
    currency: 'BRL',
  },
];

export const MOCK_PAYMENT_METHODS = ['Cartão de Crédito', 'Cartão de Débito', 'Pix'];

const CART_TTL_MS = 30 * 60 * 1000;
const DECLINED_CARD_SUFFIX = '0002';

interface MockCart {
  id: string;
  products: Product[];
  expiresAt: number;
  approved: CheckoutResponse | null;
}

export class MockCheckoutBackend {
  private readonly carts = new Map<string, MockCart>();

  constructor(private readonly clock: Clock) {}

  preCheckout(request: PreCheckoutRequest): PreCheckoutResponse {
    const slugs = [...new Set((request.products ?? []).map((item) => item.slug?.trim().toLowerCase()))];
    if (slugs.length === 0 || slugs.some((slug) => !slug)) {
      throw mockError('INVALID_REQUEST', null);
    }
    const products = slugs.map((slug) => MOCK_CATALOG.find((product) => product.slug === slug));
    if (products.some((product) => product === undefined)) {
      throw mockError('PRODUCT_NOT_FOUND', null);
    }
    const cart: MockCart = {
      id: crypto.randomUUID(),
      products: products as Product[],
      expiresAt: this.clock().getTime() + CART_TTL_MS,
      approved: null,
    };
    this.carts.set(cart.id, cart);
    return {
      cartId: cart.id,
      products: cart.products,
      paymentMethods: MOCK_PAYMENT_METHODS.map((name) => ({ name })),
    };
  }

  checkout(request: CheckoutRequest): CheckoutResponse {
    const cart = this.carts.get(request.cartId);
    if (!cart) {
      throw mockError('CART_NOT_FOUND', request.cartId);
    }
    if (cart.approved) {
      throw mockError('PAYMENT_ALREADY_APPROVED', cart.id);
    }
    if (this.clock().getTime() >= cart.expiresAt) {
      throw mockError('CART_EXPIRED', cart.id);
    }
    const methodName = request.paymentMethod?.name ?? '';
    const type = MOCK_PAYMENT_METHODS.includes(methodName) ? resolvePaymentMethodType(methodName) : null;
    if (!type) {
      throw mockError('PAYMENT_METHOD_NOT_ALLOWED', cart.id);
    }
    const card = request.paymentMethod.card;
    if ((type === 'PIX') === Boolean(card)) {
      throw mockError('INVALID_PAYMENT_DATA', cart.id);
    }
    if (card && digitsOnly(card.number).endsWith(DECLINED_CARD_SUFFIX)) {
      throw mockError('PAYMENT_DECLINED', cart.id);
    }
    cart.approved = this.approve(cart, methodName, type, card?.number);
    return cart.approved;
  }

  private approve(
    cart: MockCart,
    methodName: string,
    type: PaymentMethodType,
    cardNumber: string | undefined,
  ): CheckoutResponse {
    const amount = cart.products.reduce((total, product) => total + product.price, 0);
    const transactionId = crypto.randomUUID();
    return {
      cartId: cart.id,
      status: 'APROVADO',
      paidAt: this.clock().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      payment: {
        method: methodName,
        ...(type === 'PIX'
          ? {
              pixCode: buildPixCode({
                key: crypto.randomUUID(),
                amount,
                transactionId,
                merchantName: 'Checkout Assinaturas',
                merchantCity: 'Belem',
              }),
            }
          : { lastDigits: lastDigits(cardNumber ?? '') }),
        amount,
        currency: 'BRL',
      },
      products: cart.products.map(({ slug, name, price }) => ({ slug, name, price })),
    };
  }
}
