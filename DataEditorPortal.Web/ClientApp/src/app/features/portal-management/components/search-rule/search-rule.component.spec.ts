import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRuleComponent } from './search-rule.component';

describe('SearchRuleComponent', () => {
  let component: SearchRuleComponent;
  let fixture: ComponentFixture<SearchRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRuleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
