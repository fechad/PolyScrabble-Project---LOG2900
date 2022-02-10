import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { GameSetupDialogComponent } from './game-setup-dialog.component';

export class MatDialogRefMock {
    close() {
        return { afterClosed: () => of({}) };
    }
}

describe('GameSetupDialogComponent', () => {
    let component: GameSetupDialogComponent;
    let fixture: ComponentFixture<GameSetupDialogComponent>;
    let router: Router;
    let formBuilder: FormBuilder;
    let matDialogData: typeof MAT_DIALOG_DATA;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSetupDialogComponent],
            providers: [
                { provide: Router, useValue: router },
                { provide: FormBuilder, useClass: formBuilder },
                { provide: MatDialogRef, useValue: MatDialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: matDialogData },
            ],
            imports: [HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSetupDialogComponent);
        component = fixture.componentInstance;
        component.gameParametersForm = new FormGroup({
            id: new FormControl(''),
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            timer: new FormControl(''),
            dictionary: new FormControl(''),
        });

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    fit('click on closing button should call close on dialog', fakeAsync(() => {
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        const button = fixture.debugElement.query(By.css('.icone-cancel'));
        button.nativeElement.click();
        tick();
        expect(closeDialogSpy).toHaveBeenCalled();
    }));
});
