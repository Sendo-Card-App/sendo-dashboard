import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtAlluserComponent } from './ut-alluser.component';

describe('UtAlluserComponent', () => {
  let component: UtAlluserComponent;
  let fixture: ComponentFixture<UtAlluserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtAlluserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtAlluserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
