import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalListComponent } from './portal-list.component';

describe('PortalListComponent', () => {
  let component: PortalListComponent;
  let fixture: ComponentFixture<PortalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
