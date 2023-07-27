import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteGroupComponent } from './site-group.component';

describe('SiteGroupComponent', () => {
  let component: SiteGroupComponent;
  let fixture: ComponentFixture<SiteGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteGroupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SiteGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
