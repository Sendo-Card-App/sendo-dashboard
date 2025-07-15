import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDetailListComponent } from './card-detail-list.component';

describe('CardDetailListComponent', () => {
  let component: CardDetailListComponent;
  let fixture: ComponentFixture<CardDetailListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDetailListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDetailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
