import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinSetupDialogComponent } from './join-setup-dialog.component';

describe('JoinSetupDialogComponent', () => {
  let component: JoinSetupDialogComponent;
  let fixture: ComponentFixture<JoinSetupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinSetupDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinSetupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
