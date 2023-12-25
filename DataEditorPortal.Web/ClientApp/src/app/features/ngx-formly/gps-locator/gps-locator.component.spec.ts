import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsLocatorComponent } from './gps-locator.component';

describe('GpsLocatorComponent', () => {
  let component: GpsLocatorComponent;
  let fixture: ComponentFixture<GpsLocatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GpsLocatorComponent]
    });
    fixture = TestBed.createComponent(GpsLocatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
