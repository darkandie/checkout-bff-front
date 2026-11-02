import { Routes } from '@angular/router';
import { paymentFailedGuard, paymentSucceededGuard } from './features/result/result.guards';
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
      {
        path: 'sucesso',
        title: 'Pagamento confirmado · Nexo',
        canActivate: [paymentSucceededGuard],
        loadComponent: () => import('./features/result/success-page').then((m) => m.SuccessPage),
      },
      {
        path: 'erro',
        title: 'Pagamento não concluído · Nexo',
        canActivate: [paymentFailedGuard],
        loadComponent: () => import('./features/result/failure-page').then((m) => m.FailurePage),
      },
    ],
  },
  { path: '**', redirectTo: 'checkout/pagamento' },
];
