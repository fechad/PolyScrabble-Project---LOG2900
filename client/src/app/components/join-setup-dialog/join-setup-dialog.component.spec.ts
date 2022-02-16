import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { JoinSetupDialogComponent } from './join-setup-dialog.component';

import SpyObj = jasmine.SpyObj;

const dialogMock = {
    close: () => {
        return;
    },
};

describe('JoinSetupDialogComponent', () => {
    let component: JoinSetupDialogComponent;
    let fixture: ComponentFixture<JoinSetupDialogComponent>;
    // let dialogRef: MatDialogRef<JoinSetupDialogComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [JoinSetupDialogComponent],
            imports: [
                HttpClientTestingModule,
                MatCardModule,
                RouterTestingModule.withRoutes(routes),
                HttpClientModule,
                AppRoutingModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialogRef, useValue: dialogMock },
                FormBuilder,
                { provide: Router, useValue: router },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();

        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinSetupDialogComponent);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['rooms'], ['joinRoom']);
        component = fixture.componentInstance;
        component.joiningRoomForm = new FormGroup({
            secondPlayerName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]*$')]),
        });

        component.ngOnInit();
        fixture.detectChanges();
    });

    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });

    // it('form invalid if no name entered', () => {
    //     expect(component.joiningRoomForm.valid).toBeFalsy();
    // });

    // it('click on cancel button should call closeDialog() function', fakeAsync(() => {
    //     spyOn(component, 'closeDialog');
    //     fixture.debugElement.query(By.css('.icone-cancel')).nativeElement.click();
    //     tick();
    //     expect(component.closeDialog).toHaveBeenCalled();
    // }));

    // it('function closeDialog of component should call close to components dialog', () => {
    //     const closeDialogSpy = spyOn(component.dialogRef, 'close');
    //     component.closeDialog();
    //     expect(closeDialogSpy).toHaveBeenCalled();
    // });
});
