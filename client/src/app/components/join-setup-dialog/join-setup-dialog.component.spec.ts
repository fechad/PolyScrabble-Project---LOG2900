import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { JoinSetupDialogComponent } from './join-setup-dialog.component';

export class MatDialogRefMock {
    close() {
        return { afterClosed: () => of({}) };
    }
}
describe('JoinSetupDialogComponent', () => {
    let component: JoinSetupDialogComponent;
    let fixture: ComponentFixture<JoinSetupDialogComponent>;
    let formBuilder: FormBuilder;
    let dialogRef: MatDialogRef<JoinSetupDialogComponent>;
    let matDialogData: typeof MAT_DIALOG_DATA;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinSetupDialogComponent],
            providers: [
                { provide: CommunicationService, useClass: CommunicationService },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: Router, useValue: {} },
                { provide: MatDialogRef, useValue: dialogRef },
                { provide: MAT_DIALOG_DATA, useValue: matDialogData },
            ],
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

    it('click on cancel button should call closeDialog() function', fakeAsync(() => {
        spyOn(component, 'closeDialog');
        fixture.debugElement.query(By.css('.icone-cancel')).nativeElement.click();
        tick();
        expect(component.closeDialog).toHaveBeenCalled();
    }));

    it('function closeDialog of component should call close to components dialog', () => {
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        component.closeDialog();
        expect(closeDialogSpy).toHaveBeenCalled();
    });
});
