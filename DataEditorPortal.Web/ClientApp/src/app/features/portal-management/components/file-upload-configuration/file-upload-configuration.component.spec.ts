import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadConfigurationComponent } from './file-upload-configuration.component';

describe('FileUploadConfigurationComponent', () => {
  let component: FileUploadConfigurationComponent;
  let fixture: ComponentFixture<FileUploadConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileUploadConfigurationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
