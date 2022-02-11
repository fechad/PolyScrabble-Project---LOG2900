import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndgamePopUpComponent } from './endgame-pop-up.component';

describe('EndgamePopUpComponent', () => {
  let component: EndgamePopUpComponent;
  let fixture: ComponentFixture<EndgamePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndgamePopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndgamePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
