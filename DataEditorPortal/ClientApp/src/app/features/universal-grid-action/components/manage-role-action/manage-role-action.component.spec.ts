import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerRoleComponent } from './manage-role.component-action';

describe('ManagerRoleComponent', () => {
  let component: ManagerRoleComponent;
  let fixture: ComponentFixture<ManagerRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagerRoleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
