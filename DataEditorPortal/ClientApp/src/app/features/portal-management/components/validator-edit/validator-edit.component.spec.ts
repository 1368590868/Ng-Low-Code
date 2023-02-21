import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidatorEditComponent } from './validator-edit.component';

describe('ValidatorComponent', () => {
  let component: ValidatorEditComponent;
  let fixture: ComponentFixture<ValidatorEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidatorEditComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ValidatorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
