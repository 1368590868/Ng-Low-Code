import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDictionaryDialogComponent } from './add-dictionary-dialog.component';

describe('AddDictionaryDialogComponent', () => {
  let component: AddDictionaryDialogComponent;
  let fixture: ComponentFixture<AddDictionaryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddDictionaryDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddDictionaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
