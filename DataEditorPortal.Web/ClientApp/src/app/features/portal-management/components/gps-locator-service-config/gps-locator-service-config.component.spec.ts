import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsLocatorServiceConfigComponent } from './gps-locator-service-config.component';

describe('GpsLocatorConfigurationComponent', () => {
  let component: GpsLocatorServiceConfigComponent;
  let fixture: ComponentFixture<GpsLocatorServiceConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GpsLocatorServiceConfigComponent]
    });
    fixture = TestBed.createComponent(GpsLocatorServiceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
