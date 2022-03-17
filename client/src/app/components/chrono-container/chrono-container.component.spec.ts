import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChronoContainerComponent } from './chrono-container.component';

describe('ChronoContainerComponent', () => {
  let component: ChronoContainerComponent;
  let fixture: ComponentFixture<ChronoContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChronoContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChronoContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
