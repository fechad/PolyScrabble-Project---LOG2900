import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

import SpyObj = jasmine.SpyObj;

describe('WaitingRoomPageComponent', () => {
    // let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let router: Router;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            declarations: [WaitingRoomPageComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();

        // const selectedRoom = 'selectedRoom';
        // Object.defineProperty(communicationServiceSpy, selectedRoom, { value: '0' });
    });

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['leave']);
        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        router = TestBed.inject(Router);
        router.initialNavigation();
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // TO-DO: should create fails
    // it('should create', () => {
    //     expect(component).toBeTruthy();
    // });

    // it('leave should call leave from CommunicationService', () => {
    //     component.leave();
    //     expect(communicationServiceSpy.leave).toHaveBeenCalled();
    // });

    // it('start should call start from CommunicationService', () => {
    //     component.start();
    //     expect(communicationServiceSpy.start).toHaveBeenCalled();
    // });

    // it('kick should call kick from CommunicationService', () => {
    //     component.kick();
    //     expect(communicationServiceSpy.kick).toHaveBeenCalled();
    // });
});
