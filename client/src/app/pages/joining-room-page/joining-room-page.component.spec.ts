import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoiningRoomPageComponent } from './joining-room-page.component';

describe('JoiningRoomPageComponent', () => {
  let component: JoiningRoomPageComponent;
  let fixture: ComponentFixture<JoiningRoomPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoiningRoomPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoiningRoomPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
