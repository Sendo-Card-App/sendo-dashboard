import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrAddtransactionComponent } from './tr-addtransaction.component';

describe('TrAddtransactionComponent', () => {
  let component: TrAddtransactionComponent;
  let fixture: ComponentFixture<TrAddtransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrAddtransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrAddtransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
