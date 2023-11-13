import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMultipleRecordActionComponent } from './edit-multiple-record-action.component';

describe('EditMultipleRecordActionComponent', () => {
  let component: EditMultipleRecordActionComponent;
  let fixture: ComponentFixture<EditMultipleRecordActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditMultipleRecordActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditMultipleRecordActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
