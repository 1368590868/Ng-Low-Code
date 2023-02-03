import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermissionActionComponent } from './user-permission-action.component';

describe('UserPermissionComponent', () => {
  let component: UserPermissionActionComponent;
  let fixture: ComponentFixture<UserPermissionActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserPermissionActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserPermissionActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
