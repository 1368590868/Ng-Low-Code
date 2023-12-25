import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GPSLocatorFieldsConfigComponent } from './gps-locator-fields-config.component';

describe('GPSLocatorFieldsConfigComponent', () => {
  let component: GPSLocatorFieldsConfigComponent;
  let fixture: ComponentFixture<GPSLocatorFieldsConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GPSLocatorFieldsConfigComponent]
    });
    fixture = TestBed.createComponent(GPSLocatorFieldsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
