import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleActionComponent } from './user-role-action.component';

describe('UserRoleActionComponent', () => {
  let component: UserRoleActionComponent;
  let fixture: ComponentFixture<UserRoleActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserRoleActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserRoleActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
