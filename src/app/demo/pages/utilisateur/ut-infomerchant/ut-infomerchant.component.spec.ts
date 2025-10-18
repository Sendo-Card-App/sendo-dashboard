import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtInfomerchantComponent } from './ut-infomerchant.component';

describe('UtInfomerchantComponent', () => {
  let component: UtInfomerchantComponent;
  let fixture: ComponentFixture<UtInfomerchantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtInfomerchantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtInfomerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
