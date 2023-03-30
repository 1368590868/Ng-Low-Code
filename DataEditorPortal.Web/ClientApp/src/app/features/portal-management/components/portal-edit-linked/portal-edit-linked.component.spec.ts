import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditLinkedComponent } from './portal-edit-linked.component';

describe('PortalEditLinkedComponent', () => {
  let component: PortalEditLinkedComponent;
  let fixture: ComponentFixture<PortalEditLinkedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalEditLinkedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortalEditLinkedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
