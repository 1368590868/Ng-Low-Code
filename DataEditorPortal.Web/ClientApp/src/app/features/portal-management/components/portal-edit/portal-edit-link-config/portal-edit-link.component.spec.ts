import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditLinkComponent } from './portal-edit-link.component';

describe('PortalEditLinkComponent', () => {
  let component: PortalEditLinkComponent;
  let fixture: ComponentFixture<PortalEditLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditLinkComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
