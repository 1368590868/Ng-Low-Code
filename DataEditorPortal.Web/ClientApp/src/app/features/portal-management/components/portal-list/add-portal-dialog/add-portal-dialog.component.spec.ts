import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPortalDialogComponent } from './add-portal-dialog.component';

describe('AddPortalDialogComponent', () => {
  let component: AddPortalDialogComponent;
  let fixture: ComponentFixture<AddPortalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPortalDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddPortalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
