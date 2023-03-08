import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputedValueEditorComponent } from './computed-value-editor.component';

describe('ComputedValueEditorComponent', () => {
  let component: ComputedValueEditorComponent;
  let fixture: ComponentFixture<ComputedValueEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComputedValueEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComputedValueEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
