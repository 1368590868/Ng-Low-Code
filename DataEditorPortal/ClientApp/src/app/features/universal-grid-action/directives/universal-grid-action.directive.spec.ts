import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalGridActionDirective } from './universal-grid-action.directive';

describe('UniversalGridActionDirective', () => {
  let component: UniversalGridActionDirective;
  let fixture: ComponentFixture<UniversalGridActionDirective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UniversalGridActionDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(UniversalGridActionDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
