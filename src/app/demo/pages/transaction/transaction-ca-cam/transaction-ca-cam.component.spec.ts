import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionCaCamComponent } from './transaction-ca-cam.component';

describe('TransactionCaCamComponent', () => {
  let component: TransactionCaCamComponent;
  let fixture: ComponentFixture<TransactionCaCamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionCaCamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionCaCamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
