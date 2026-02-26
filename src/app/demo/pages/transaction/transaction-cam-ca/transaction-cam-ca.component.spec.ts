import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionCamCaComponent } from './transaction-cam-ca.component';

describe('TransactionCaCamComponent', () => {
  let component: TransactionCamCaComponent;
  let fixture: ComponentFixture<TransactionCamCaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionCamCaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionCamCaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
