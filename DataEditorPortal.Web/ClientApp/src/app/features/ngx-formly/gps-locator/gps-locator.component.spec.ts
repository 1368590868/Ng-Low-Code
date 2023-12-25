import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GPSLocatorComponent } from './gps-locator.component';

describe('GPSLocatorComponent', () => {
  let component: GPSLocatorComponent;
  let fixture: ComponentFixture<GPSLocatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GPSLocatorComponent]
    });
    fixture = TestBed.createComponent(GPSLocatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
