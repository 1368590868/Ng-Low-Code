import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbConnectionDialogComponent } from './db-connection-dialog.component';

describe('DbConnectionDialogComponent', () => {
  let component: DbConnectionDialogComponent;
  let fixture: ComponentFixture<DbConnectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DbConnectionDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DbConnectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
