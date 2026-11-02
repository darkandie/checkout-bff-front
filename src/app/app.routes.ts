import { Routes } from '@angular/router';
import { CheckoutShell } from './layout/checkout-shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'checkout/pagamento' },
  {
    path: 'checkout',
    component: CheckoutShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pagamento' },
      {
        path: 'pagamento',
        title: 'Pagamento · Nexo',
        loadComponent: () => import('./features/payment/payment-page').then((m) => m.PaymentPage),
      },
    ],
  },
  { path: '**', redirectTo: 'checkout/pagamento' },
];
