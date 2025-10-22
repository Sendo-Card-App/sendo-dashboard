import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtsAllComponent } from './debts-all.component';

describe('DebtsAllComponent', () => {
  let component: DebtsAllComponent;
  let fixture: ComponentFixture<DebtsAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtsAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
