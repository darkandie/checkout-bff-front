import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { CHECKOUT_CONFIG } from './core/config/checkout-config';
import { provideBrazilianLocale } from './core/config/locale';
import { correlationIdInterceptor } from './core/http/correlation-id.interceptor';
import { mockBackendInterceptor } from './core/mock/mock-backend.interceptor';

const interceptors = environment.useMockBackend
  ? [correlationIdInterceptor, mockBackendInterceptor]
  : [correlationIdInterceptor];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors(interceptors)),
    provideBrazilianLocale(),
    { provide: CHECKOUT_CONFIG, useValue: environment },
  ],
};
