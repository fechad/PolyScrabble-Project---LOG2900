import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DictionaryTabComponent } from './dictionary-tab.component';

describe('DictionaryTabComponent', () => {
  let component: DictionaryTabComponent;
  let fixture: ComponentFixture<DictionaryTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DictionaryTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DictionaryTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
