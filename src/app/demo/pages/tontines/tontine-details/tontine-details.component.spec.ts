import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TontineDetailsComponent } from './tontine-details.component';

describe('TontineDetailsComponent', () => {
  let component: TontineDetailsComponent;
  let fixture: ComponentFixture<TontineDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TontineDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TontineDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
