import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditComponent } from './portal-edit.component';

describe('PortalEditComponent', () => {
  let component: PortalEditComponent;
  let fixture: ComponentFixture<PortalEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
