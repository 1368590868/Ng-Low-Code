import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileNetWOComponent } from './filenetwo.component';

describe('FileNetWOComponent', () => {
  let component: FileNetWOComponent;
  let fixture: ComponentFixture<FileNetWOComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileNetWOComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileNetWOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
