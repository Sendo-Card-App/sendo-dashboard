import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtMerchantComponent } from './ut-merchant.component';

describe('UtMerchantComponent', () => {
  let component: UtMerchantComponent;
  let fixture: ComponentFixture<UtMerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtMerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtMerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
