import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DCGroupContactComponent } from './dcgroup-contact.component';

describe('DCGroupContactComponent', () => {
  let component: DCGroupContactComponent;
  let fixture: ComponentFixture<DCGroupContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DCGroupContactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DCGroupContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
