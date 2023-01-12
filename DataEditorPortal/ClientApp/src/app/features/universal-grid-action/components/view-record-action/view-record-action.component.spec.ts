import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecordActionComponent } from './view-record-action.component';

describe('ViewRecordActionComponent', () => {
  let component: ViewRecordActionComponent;
  let fixture: ComponentFixture<ViewRecordActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewRecordActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRecordActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
