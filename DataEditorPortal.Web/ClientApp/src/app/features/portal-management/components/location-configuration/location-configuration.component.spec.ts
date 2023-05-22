import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationConfigurationComponent } from './location-configuration.component';

describe('LocationConfigurationComponent', () => {
  let component: LocationConfigurationComponent;
  let fixture: ComponentFixture<LocationConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationConfigurationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
