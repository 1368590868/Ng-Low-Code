import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalGridComponent } from './universal-grid.component';

describe('UniversalGridComponent', () => {
  let component: UniversalGridComponent;
  let fixture: ComponentFixture<UniversalGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UniversalGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UniversalGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
