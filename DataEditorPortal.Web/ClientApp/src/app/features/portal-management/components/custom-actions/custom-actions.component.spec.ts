import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomActionsComponent } from './custom-actions.component';

describe('CustomActionsComponent', () => {
  let component: CustomActionsComponent;
  let fixture: ComponentFixture<CustomActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomActionsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
