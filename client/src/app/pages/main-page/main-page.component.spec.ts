import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';

import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let location: Location;
    let matDialog: MatDialog;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of());
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: Location, useValue: location },
                { provide: MatDialog, useValue: matDialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    /*
    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(communicationServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(communicationServiceSpy.basicPost).toHaveBeenCalled();
    });

    fit('click on classic button should redirect to /modes/classic page', fakeAsync(() => {
        fixture.debugElement.query(By.css('.classic')).nativeElement.click();
        tick();
        expect(location.path()).toBe('/modes/classic');
    }));*/
});
