import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeButtonOptionsComponent } from './three-button-options.component';

describe('ThreeButtonOptionsComponent', () => {
  let component: ThreeButtonOptionsComponent;
  let fixture: ComponentFixture<ThreeButtonOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreeButtonOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeButtonOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
