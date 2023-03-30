import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLayoutDeleteComponent } from './form-layout-delete.component';

describe('FormLayoutDeleteComponent', () => {
  let component: FormLayoutDeleteComponent;
  let fixture: ComponentFixture<FormLayoutDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormLayoutDeleteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormLayoutDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
