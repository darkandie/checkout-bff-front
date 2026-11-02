import { InjectionToken } from '@angular/core';

export interface CheckoutConfig {
  apiBaseUrl: string;
  useMockBackend: boolean;
  defaultPlan: string;
}

export const CHECKOUT_CONFIG = new InjectionToken<CheckoutConfig>('CHECKOUT_CONFIG');
