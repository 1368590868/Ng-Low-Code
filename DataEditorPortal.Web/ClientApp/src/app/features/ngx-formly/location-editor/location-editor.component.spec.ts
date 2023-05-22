import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationEditorComponent } from './location-editor.component';

describe('LocationEditorComponent', () => {
  let component: LocationEditorComponent;
  let fixture: ComponentFixture<LocationEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
