import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalEditDatasourceComponent } from './portal-edit-datasource.component';

describe('PortalEditDatasourceComponent', () => {
  let component: PortalEditDatasourceComponent;
  let fixture: ComponentFixture<PortalEditDatasourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalEditDatasourceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalEditDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
