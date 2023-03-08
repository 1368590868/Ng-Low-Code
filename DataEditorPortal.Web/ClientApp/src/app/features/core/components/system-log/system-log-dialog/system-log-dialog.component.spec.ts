import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemLogDialogComponent } from './system-log-dialog.component';

describe('SystemLogDialogComponent', () => {
  let component: SystemLogDialogComponent;
  let fixture: ComponentFixture<SystemLogDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemLogDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemLogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
