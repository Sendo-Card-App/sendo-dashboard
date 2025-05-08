import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycAllComponent } from './kyc-all.component';

describe('KycAllComponent', () => {
  let component: KycAllComponent;
  let fixture: ComponentFixture<KycAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
