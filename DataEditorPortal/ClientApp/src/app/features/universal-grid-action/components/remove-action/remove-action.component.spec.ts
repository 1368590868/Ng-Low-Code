import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveActionComponent } from './remove-action.component';

describe('RemoveActionComponent', () => {
  let component: RemoveActionComponent;
  let fixture: ComponentFixture<RemoveActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemoveActionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
