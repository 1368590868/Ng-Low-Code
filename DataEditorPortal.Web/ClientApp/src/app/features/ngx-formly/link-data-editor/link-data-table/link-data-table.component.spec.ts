import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkDataTableComponent } from './link-data-table.component';

describe('LinkDataTableComponent', () => {
  let component: LinkDataTableComponent;
  let fixture: ComponentFixture<LinkDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkDataTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LinkDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
