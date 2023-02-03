import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoleActionComponent } from './manage-role.component-action';

describe('ManagerRoleComponent', () => {
  let component: ManageRoleActionComponent;
  let fixture: ComponentFixture<ManageRoleActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageRoleActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageRoleActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
