import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TontineStatsComponent } from './tontine-stats.component';

describe('TontineStatsComponent', () => {
  let component: TontineStatsComponent;
  let fixture: ComponentFixture<TontineStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TontineStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TontineStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
