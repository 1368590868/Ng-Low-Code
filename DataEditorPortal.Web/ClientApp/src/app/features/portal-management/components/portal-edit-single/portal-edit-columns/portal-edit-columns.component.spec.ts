import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditColumnsComponent } from './portal-edit-columns.component';

describe('PortalEditColumnsComponent', () => {
  let component: PortalEditColumnsComponent;
  let fixture: ComponentFixture<PortalEditColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditColumnsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
