import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TontineListmemberComponent } from './tontine-listmember.component';

describe('TontineListmemberComponent', () => {
  let component: TontineListmemberComponent;
  let fixture: ComponentFixture<TontineListmemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TontineListmemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TontineListmemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
