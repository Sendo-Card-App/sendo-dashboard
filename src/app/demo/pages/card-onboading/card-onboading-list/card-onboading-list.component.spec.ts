import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOnboardingListComponent } from './card-onboading-list.component';

describe('CardOnboadingListComponent', () => {
  let component: CardOnboardingListComponent;
  let fixture: ComponentFixture<CardOnboardingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOnboardingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardOnboardingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


