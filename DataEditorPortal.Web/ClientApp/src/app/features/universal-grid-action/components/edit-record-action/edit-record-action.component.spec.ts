import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRecordActionComponent } from './edit-record-action.component';

describe('EditRecordActionComponent', () => {
  let component: EditRecordActionComponent;
  let fixture: ComponentFixture<EditRecordActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditRecordActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EditRecordActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
