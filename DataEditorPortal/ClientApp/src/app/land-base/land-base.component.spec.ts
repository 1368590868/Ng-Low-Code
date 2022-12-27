import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandBaseComponent } from './land-base.component';

describe('LandBaseComponent', () => {
  let component: LandBaseComponent;
  let fixture: ComponentFixture<LandBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
