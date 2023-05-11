import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExcelActionComponent } from './import-excel-action.component';

describe('ImportExcelActionComponent', () => {
  let component: ImportExcelActionComponent;
  let fixture: ComponentFixture<ImportExcelActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportExcelActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportExcelActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
