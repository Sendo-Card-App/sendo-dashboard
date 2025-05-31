import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundRequestDetailComponent } from './fund-request-detail.component';

describe('FundRequestDetailComponent', () => {
  let component: FundRequestDetailComponent;
  let fixture: ComponentFixture<FundRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundRequestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
