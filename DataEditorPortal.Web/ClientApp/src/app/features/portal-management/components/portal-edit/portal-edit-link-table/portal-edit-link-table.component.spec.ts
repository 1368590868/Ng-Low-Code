import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditLinkTableComponent } from './portal-edit-link-table.component';

describe('PortalEditLinkTableComponent', () => {
  let component: PortalEditLinkTableComponent;
  let fixture: ComponentFixture<PortalEditLinkTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalEditLinkTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortalEditLinkTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
