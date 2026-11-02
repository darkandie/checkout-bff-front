export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';

export interface Product {
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export interface PaymentMethodOption {
  name: string;
}

export interface PreCheckoutRequest {
  products: { slug: string }[];
}

export interface PreCheckoutResponse {
  cartId: string;
  products: Product[];
  paymentMethods: PaymentMethodOption[];
}

export interface CardPayload {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface CheckoutRequest {
  cartId: string;
  paymentMethod: {
    name: string;
    card?: CardPayload;
  };
}

export interface PaymentSummary {
  method: string;
  lastDigits?: string;
  pixCode?: string;
  amount: number;
  currency: string;
}

export interface PurchasedProduct {
  slug: string;
  name: string;
  price: number;
}

export interface CheckoutResponse {
  cartId: string;
  status: string;
  paidAt: string;
  payment: PaymentSummary;
  products: PurchasedProduct[];
}

export type DisplayType = 'BLOCK' | 'INTERVENTION';

export interface ErrorAction {
  label: string;
  url: string;
}

export interface FrontendError {
  code: string;
  title: string;
  description: string;
  primaryButton: ErrorAction | null;
  secondaryButton: ErrorAction | null;
}

export interface FrontendErrorResponse {
  displayType: DisplayType;
  errorCode: string;
  cartId: string | null;
  frontendError: FrontendError;
}
