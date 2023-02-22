import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatorEditorComponent } from './validator-editor.component';

describe('ValidatorComponent', () => {
  let component: ValidatorEditorComponent;
  let fixture: ComponentFixture<ValidatorEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidatorEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidatorEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
