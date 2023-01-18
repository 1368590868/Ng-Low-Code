import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditFormComponent } from './portal-edit-form.component';

describe('PortalEditFormComponent', () => {
  let component: PortalEditFormComponent;
  let fixture: ComponentFixture<PortalEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
