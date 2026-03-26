import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesEmprunts } from './mes-emprunts';

describe('MesEmprunts', () => {
  let component: MesEmprunts;
  let fixture: ComponentFixture<MesEmprunts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesEmprunts],
    }).compileComponents();

    fixture = TestBed.createComponent(MesEmprunts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
