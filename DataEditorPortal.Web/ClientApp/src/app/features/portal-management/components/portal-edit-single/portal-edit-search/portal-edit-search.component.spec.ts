import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditSearchComponent } from './portal-edit-search.component';

describe('PortalEditSearchComponent', () => {
  let component: PortalEditSearchComponent;
  let fixture: ComponentFixture<PortalEditSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditSearchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
