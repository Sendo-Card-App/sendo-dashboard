import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundRequestListComponent } from './fund-request-list.component';

describe('FundRequestListComponent', () => {
  let component: FundRequestListComponent;
  let fixture: ComponentFixture<FundRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
