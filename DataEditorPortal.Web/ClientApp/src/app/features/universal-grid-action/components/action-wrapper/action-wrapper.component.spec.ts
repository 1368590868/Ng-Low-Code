import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionWrapperComponent } from './action-wrapper.component';

describe('ActionWrapperComponent', () => {
  let component: ActionWrapperComponent;
  let fixture: ComponentFixture<ActionWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
