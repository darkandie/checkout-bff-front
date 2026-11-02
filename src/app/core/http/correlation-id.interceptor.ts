import { HttpInterceptorFn } from '@angular/common/http';

export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.headers.has(CORRELATION_ID_HEADER)) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { [CORRELATION_ID_HEADER]: crypto.randomUUID() } }));
};
