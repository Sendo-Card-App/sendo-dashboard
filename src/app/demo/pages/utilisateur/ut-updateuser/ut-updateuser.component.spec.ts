import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtUpdateuserComponent } from './ut-updateuser.component';

describe('UtUpdateuserComponent', () => {
  let component: UtUpdateuserComponent;
  let fixture: ComponentFixture<UtUpdateuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtUpdateuserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtUpdateuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
