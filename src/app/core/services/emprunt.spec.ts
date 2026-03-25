import { TestBed } from '@angular/core/testing';

import { Emprunt } from './emprunt';

describe('Emprunt', () => {
  let service: Emprunt;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Emprunt);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
