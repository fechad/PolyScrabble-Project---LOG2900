import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloDialogComponent } from './solo-dialog.component';

describe('SoloDialogComponent', () => {
  let component: SoloDialogComponent;
  let fixture: ComponentFixture<SoloDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoloDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoloDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
