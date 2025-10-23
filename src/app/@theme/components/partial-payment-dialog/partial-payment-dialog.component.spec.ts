import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialPaymentDialogComponent } from './partial-payment-dialog.component';

describe('PartialPaymentDialogComponent', () => {
  let component: PartialPaymentDialogComponent;
  let fixture: ComponentFixture<PartialPaymentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartialPaymentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartialPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
