import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditSingleComponent } from './portal-edit-single.component';

describe('PortalEditSingleComponent', () => {
  let component: PortalEditSingleComponent;
  let fixture: ComponentFixture<PortalEditSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditSingleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
