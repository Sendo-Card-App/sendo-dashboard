import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtAdduserComponent } from './ut-adduser.component';

describe('UtAdduserComponent', () => {
  let component: UtAdduserComponent;
  let fixture: ComponentFixture<UtAdduserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtAdduserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtAdduserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
