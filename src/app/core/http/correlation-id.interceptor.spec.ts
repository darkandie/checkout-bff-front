import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CORRELATION_ID_HEADER, correlationIdInterceptor } from './correlation-id.interceptor';

describe('correlationIdInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([correlationIdInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  it('adds a new correlation id to every request', () => {
    http.get('/a').subscribe();
    http.get('/b').subscribe();

    const first = controller.expectOne('/a').request.headers.get(CORRELATION_ID_HEADER);
    const second = controller.expectOne('/b').request.headers.get(CORRELATION_ID_HEADER);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(second).not.toBe(first);
  });

  it('keeps a correlation id set by the caller', () => {
    http.get('/a', { headers: { [CORRELATION_ID_HEADER]: 'given-id' } }).subscribe();

    expect(controller.expectOne('/a').request.headers.get(CORRELATION_ID_HEADER)).toBe('given-id');
  });
});
