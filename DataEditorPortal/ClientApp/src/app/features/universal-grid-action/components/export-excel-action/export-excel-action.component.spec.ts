import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportExcelActionComponent } from './export-excel-action.component';

describe('ExportExcelActionComponent', () => {
  let component: ExportExcelActionComponent;
  let fixture: ComponentFixture<ExportExcelActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportExcelActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportExcelActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
