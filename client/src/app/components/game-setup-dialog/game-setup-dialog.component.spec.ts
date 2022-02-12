import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { GameSetupDialogComponent } from './game-setup-dialog.component';

const dialogMock = {
    close: () => {},
};

describe('GameSetupDialogComponent', () => {
    let component: GameSetupDialogComponent;
    let fixture: ComponentFixture<GameSetupDialogComponent>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [GameSetupDialogComponent],
            providers: [
                { provide: Router, useValue: router },
                { provide: FormBuilder, useClass: FormBuilder },
                { provide: MatDialogRef, useValue: dialogMock },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule, MatCardModule, MatToolbarModule, MatIconModule],
        }).compileComponents();

        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameSetupDialogComponent);
        component = fixture.componentInstance;
        component.gameParametersForm = new FormGroup({
            id: new FormControl(''),
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            minutes: new FormControl('', [Validators.required]),
            seconds: new FormControl('', [Validators.required]),
            dictionary: new FormControl(''),
        });

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click on closing button should call close on dialog', fakeAsync(() => {
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        const button = fixture.debugElement.query(By.css('.icone-cancel'));
        button.nativeElement.click();
        tick();
        expect(closeDialogSpy).toHaveBeenCalled();
    }));

    it('onSubmit should not call close on dialog when form invalid', () => {
        const dialogSpy = spyOn(component.dialogRef, 'close');
        component.onSubmit();
        expect(dialogSpy).not.toHaveBeenCalled();
    });

    it('form invalid when not all required inputs have data', () => {
        expect(component.gameParametersForm.valid).toBeFalsy();
    });

    it('form valid when player sets name', () => {
        const playerName = component.gameParametersForm.controls.playerName;
        playerName.setValue('Test');
        expect(component.gameParametersForm.valid).toBeTruthy();
    });

    it('when form is valid dialog should close', async () => {
        const playerName = component.gameParametersForm.controls.playerName;
        playerName.setValue('Test');
        const spyOnCreateRoom = spyOn(component.communicationService, 'createRoom');
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        await component.onSubmit();
        expect(spyOnCreateRoom).toHaveBeenCalled();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('when form is valid player should be redirected to waiting-room', async () => {
        const playerName = component.gameParametersForm.controls.playerName;
        playerName.setValue('Test');
        const spyOnCreateRoom = spyOn(component.communicationService, 'createRoom');
        expect(component.gameParametersForm.valid).toBeTruthy();
        await component.onSubmit();
        expect(spyOnCreateRoom).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalled();
    });

    // TO-DO: test console.error line
    // it('should console error when error found', async () => {
    //     const spyOnCreateRoom = spyOn(component.communicationService, 'createRoom');
    //     expect(spyOnCreateRoom).toHaveBeenCalled();
    //     const err = new Error();
    //     await component.onSubmit();
    //     expect(console.error).toHaveBeenCalledWith('Some error');
    // });
});
