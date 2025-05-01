import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtInfouserComponent } from './ut-infouser.component';

describe('UtInfouserComponent', () => {
  let component: UtInfouserComponent;
  let fixture: ComponentFixture<UtInfouserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtInfouserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtInfouserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
