import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtsInfoComponent } from './debts-info.component';

describe('DebtsInfoComponent', () => {
  let component: DebtsInfoComponent;
  let fixture: ComponentFixture<DebtsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
