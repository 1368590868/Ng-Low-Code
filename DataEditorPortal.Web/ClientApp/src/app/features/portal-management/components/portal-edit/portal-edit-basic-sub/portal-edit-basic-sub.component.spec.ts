import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditBasicSubComponent } from './portal-edit-basic-sub.component';

describe('PortalEditLinkTableComponent', () => {
  let component: PortalEditBasicSubComponent;
  let fixture: ComponentFixture<PortalEditBasicSubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditBasicSubComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditBasicSubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
