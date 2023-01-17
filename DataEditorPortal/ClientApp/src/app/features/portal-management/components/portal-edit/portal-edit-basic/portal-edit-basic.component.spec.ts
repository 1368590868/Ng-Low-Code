import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditBasicComponent } from './portal-edit-basic.component';

describe('PortalEditBasicComponent', () => {
  let component: PortalEditBasicComponent;
  let fixture: ComponentFixture<PortalEditBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditBasicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
