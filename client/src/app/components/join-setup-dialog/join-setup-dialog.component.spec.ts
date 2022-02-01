import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { JoinSetupDialogComponent } from './join-setup-dialog.component';

describe('JoinSetupDialogComponent', () => {
    let component: JoinSetupDialogComponent;
    let fixture: ComponentFixture<JoinSetupDialogComponent>;
    let dialogRef: MatDialogRef<JoinSetupDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinSetupDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogRef }],
        }).compileComponents();
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
