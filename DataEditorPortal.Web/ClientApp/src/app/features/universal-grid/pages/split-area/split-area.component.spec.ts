import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitAreaComponent } from './split-area.component';

describe('SplitAreaComponent', () => {
  let component: SplitAreaComponent;
  let fixture: ComponentFixture<SplitAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SplitAreaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
