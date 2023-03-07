import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedQueryDialogComponent } from './advanced-query-dialog.component';

describe('AdvancedQueryDialogComponent', () => {
  let component: AdvancedQueryDialogComponent;
  let fixture: ComponentFixture<AdvancedQueryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvancedQueryDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedQueryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
