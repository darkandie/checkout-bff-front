import { Routes } from '@angular/router';
import { CheckoutShell } from './layout/checkout-shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'checkout' },
  {
    path: 'checkout',
    component: CheckoutShell,
    children: [],
  },
  { path: '**', redirectTo: 'checkout' },
];
