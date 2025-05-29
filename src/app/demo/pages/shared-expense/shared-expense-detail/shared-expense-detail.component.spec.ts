import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedExpenseDetailComponent } from './shared-expense-detail.component';

describe('SharedExpenseDetailComponent', () => {
  let component: SharedExpenseDetailComponent;
  let fixture: ComponentFixture<SharedExpenseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedExpenseDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedExpenseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
