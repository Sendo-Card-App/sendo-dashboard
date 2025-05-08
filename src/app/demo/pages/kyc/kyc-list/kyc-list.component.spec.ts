import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycListComponent } from './kyc-list.component';

describe('KycListComponent', () => {
  let component: KycListComponent;
  let fixture: ComponentFixture<KycListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KycListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
