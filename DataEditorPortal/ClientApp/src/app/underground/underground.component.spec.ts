import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndergroundComponent } from './underground.component';

describe('UndergroundComponent', () => {
  let component: UndergroundComponent;
  let fixture: ComponentFixture<UndergroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UndergroundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndergroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
