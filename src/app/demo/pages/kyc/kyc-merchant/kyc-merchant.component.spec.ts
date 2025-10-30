import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycMerchantComponent } from './kyc-merchant.component';

describe('KycMerchantComponent', () => {
  let component: KycMerchantComponent;
  let fixture: ComponentFixture<KycMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycMerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
