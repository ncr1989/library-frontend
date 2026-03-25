import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ouvrages } from './ouvrages';

describe('Ouvrages', () => {
  let component: Ouvrages;
  let fixture: ComponentFixture<Ouvrages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ouvrages],
    }).compileComponents();

    fixture = TestBed.createComponent(Ouvrages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
