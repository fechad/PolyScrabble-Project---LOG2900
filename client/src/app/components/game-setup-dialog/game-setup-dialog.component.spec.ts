import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameSetupDialogComponent } from './game-setup-dialog.component';

describe('GameSetupDialogComponent', () => {
    let component: GameSetupDialogComponent;
    let fixture: ComponentFixture<GameSetupDialogComponent>;
    let router: Router;
    let formBuilder: FormBuilder;
    let matDialogRef: MatDialogRef<GameSetupDialogComponent>;
    let matDialogData: typeof MAT_DIALOG_DATA;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSetupDialogComponent],
            providers: [
                { provide: Router, useValue: router },
                { provide: FormBuilder, useValue: formBuilder },
                { provide: MatDialogRef, useValue: matDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: matDialogData },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSetupDialogComponent);
        component = fixture.componentInstance;

        const group = new FormGroup({
            id: new FormControl(''),
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            timer: new FormControl(''),
            dictionary: new FormControl('', [Validators.required]),
        });
        component.gameParametersForm.controls.id.setValue(group.controls.id);
        component.ngOnInit();
        fixture.detectChanges();
    });
    /*
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    */
});
