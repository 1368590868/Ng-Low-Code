import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalDictionaryComponent } from './portal-dictionary.component';

describe('PortalDictionaryComponent', () => {
  let component: PortalDictionaryComponent;
  let fixture: ComponentFixture<PortalDictionaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalDictionaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortalDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
