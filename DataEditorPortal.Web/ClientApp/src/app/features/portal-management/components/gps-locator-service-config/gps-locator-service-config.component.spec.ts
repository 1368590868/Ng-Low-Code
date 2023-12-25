import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GPSLocatorServiceConfigComponent } from './gps-locator-service-config.component';

describe('GPSLocatorConfigurationComponent', () => {
  let component: GPSLocatorServiceConfigComponent;
  let fixture: ComponentFixture<GPSLocatorServiceConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GPSLocatorServiceConfigComponent]
    });
    fixture = TestBed.createComponent(GPSLocatorServiceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
