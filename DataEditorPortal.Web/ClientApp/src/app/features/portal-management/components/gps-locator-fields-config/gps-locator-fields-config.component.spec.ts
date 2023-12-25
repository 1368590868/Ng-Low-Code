import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsLocatorFieldsConfigComponent } from './gps-locator-fields-config.component';

describe('GpsLocatorFieldsConfigComponent', () => {
  let component: GpsLocatorFieldsConfigComponent;
  let fixture: ComponentFixture<GpsLocatorFieldsConfigComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GpsLocatorFieldsConfigComponent]
    });
    fixture = TestBed.createComponent(GpsLocatorFieldsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
