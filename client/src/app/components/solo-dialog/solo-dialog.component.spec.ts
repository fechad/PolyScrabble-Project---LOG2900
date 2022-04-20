import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { State } from '@app/classes/room';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { CommunicationServiceMock } from '@app/services/communication.service.spec';
import { SoloDialogComponent } from './solo-dialog.component';

const dialogMock = {
    close: () => {
        return;
    },
};

describe('SoloDialogComponent', () => {
    let component: SoloDialogComponent;
    let fixture: ComponentFixture<SoloDialogComponent>;
    let router: jasmine.SpyObj<Router>;
    let communicationServiceSpy: CommunicationServiceMock;

    beforeEach(async () => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        communicationServiceSpy = new CommunicationServiceMock();
        await TestBed.configureTestingModule({
            declarations: [SoloDialogComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                HttpClientTestingModule,
                MatCardModule,
                RouterTestingModule.withRoutes(routes),
                HttpClientModule,
                AppRoutingModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: CommunicationService, useClass: CommunicationServiceMock, useValue: communicationServiceSpy },
                { provide: MatDialogRef, useValue: dialogMock },
                FormBuilder,
                { provide: Router, useValue: router },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SoloDialogComponent);
        component = fixture.componentInstance;
        component.soloParametersForm = new FormGroup({
            playerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
            difficulty: new FormControl(0, [Validators.required]),
            minutes: new FormControl(1, [Validators.required]),
            seconds: new FormControl(0, [Validators.required]),
            dictionnary: new FormControl(0, [Validators.required]),
        });

        component.ngOnInit();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('form invalid if no name entered', () => {
        expect(component.soloParametersForm.valid).toBeFalsy();
    });

    it('click on cancel button should call closeDialog() function', fakeAsync(() => {
        spyOn(component, 'closeDialog');
        fixture.debugElement.query(By.css('.icon-cancel')).nativeElement.click();
        tick();
        expect(component.closeDialog).toHaveBeenCalled();
    }));

    it('function closeDialog of component should call close to components dialog', () => {
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        component.closeDialog();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('switchName function should change opponent name', () => {
        component.soloParametersForm.controls.playerName.setValue('Anna');
        component.opponentName = 'Anna';
        component.checkName();
        expect(component.opponentName).not.toBe('Anna');
    });

    it('on submit dialog should close', async () => {
        communicationServiceSpy.selectedRoom.subscribe(async (room) => {
            if (room === undefined) router.navigate(['/']);
            else if (room.state === State.Started) router.navigate(['/game']);
            fixture.detectChanges();
        });
        const playerName = component.soloParametersForm.controls.playerName;
        playerName.setValue('Test');
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        await component.onSubmit();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('should not close dialog when error found', async () => {
        const closeDialogSpy = spyOn(component.dialogRef, 'close');
        await component.onSubmit();
        expect(closeDialogSpy).not.toHaveBeenCalled();
    });
});
