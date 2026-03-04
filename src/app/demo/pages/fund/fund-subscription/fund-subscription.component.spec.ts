import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalRequestComponent } from './fund-subscription.component';

describe('WithdrawalRequestComponent', () => {
  let component: WithdrawalRequestComponent;
  let fixture: ComponentFixture<WithdrawalRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawalRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithdrawalRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
