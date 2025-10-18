import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionPalierComponent } from './commission-palier.component';

describe('CommissionPalierComponent', () => {
  let component: CommissionPalierComponent;
  let fixture: ComponentFixture<CommissionPalierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionPalierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionPalierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
