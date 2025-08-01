import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubListComponent } from './pub-list.component';

describe('PubListComponent', () => {
  let component: PubListComponent;
  let fixture: ComponentFixture<PubListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PubListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
