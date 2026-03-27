import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { jwtInterceptor } from './jwt-interceptor';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('devrait ajouter l\'en-tête Authorization quand un token est présent', () => {
    localStorage.setItem('token', 'test-jwt-token');
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('ne devrait pas ajouter l\'en-tête Authorization quand aucun token n\'est présent', () => {
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });
});
