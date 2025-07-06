import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardOnboadingListComponent } from './card-onboading-list.component';

describe('CardOnboadingListComponent', () => {
  let component: CardOnboadingListComponent;
  let fixture: ComponentFixture<CardOnboadingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOnboadingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardOnboadingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
