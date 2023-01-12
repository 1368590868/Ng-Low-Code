import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagerActionComponent } from './user-manager-action.component';

describe('UserManagerActionComponent', () => {
  let component: UserManagerActionComponent;
  let fixture: ComponentFixture<UserManagerActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserManagerActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
